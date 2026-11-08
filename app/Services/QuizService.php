<?php

namespace App\Services;

use App\Models\Attempt;
use App\Models\Content;
use App\Models\Progress;
use App\Models\Quiz;
use App\Models\Space;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QuizService
{
    public function authorizeQuiz(User $user, Space $space, Quiz $quiz, ?Content $content): void
    {
        abort_unless($quiz->space_id === $space->id, 404);

        if ($content) {
            abort_unless($content->contentable_type === Quiz::class && $content->contentable_id === $quiz->id, 404);
            app(StudyService::class)->authorizeContent($user, $space, $content);
        } else {
            abort_unless($space->quiz_id === $quiz->id && $space->course->is_published, 404);
        }
    }

    public function start(User $user, Space $space, Quiz $quiz, ?Content $content): Attempt
    {
        $this->authorizeQuiz($user, $space, $quiz, $content);

        return DB::transaction(function () use ($user, $space, $quiz, $content): Attempt {
            $student = Student::query()->lockForUpdate()->findOrFail($user->student->id);
            $this->finishExpired($student, $quiz);
            $active = Attempt::query()->where('student_id', $student->id)->where('quiz_id', $quiz->id)
                ->whereNotNull('started_at')->whereNull('finished_at')->first();
            if ($active) {
                return $active;
            }

            $limit = $this->attemptLimit($student, $space, $quiz, $content);
            $count = Attempt::query()->where('student_id', $student->id)->where('quiz_id', $quiz->id)->count();
            if ($limit !== null && $count >= $limit) {
                throw ValidationException::withMessages(['quiz' => 'تعداد دفعات مجاز شرکت در آزمون به پایان رسیده است.']);
            }
            if (! $quiz->questions()->exists()) {
                throw ValidationException::withMessages(['quiz' => 'این آزمون هنوز پرسشی ندارد.']);
            }

            $attempt = new Attempt;
            $attempt->student_id = $student->id;
            $attempt->quiz_id = $quiz->id;
            $attempt->started_at = now();
            $attempt->expires_at = now()->addSeconds($quiz->duration_seconds);
            $attempt->save();

            return $attempt;
        });
    }

    public function attemptLimit(Student $student, Space $space, Quiz $quiz, ?Content $content = null): ?int
    {
        $limits = DB::table('plan_quiz')->join('enrollments', 'enrollments.plan_id', '=', 'plan_quiz.plan_id')
            ->join('plans', 'plans.id', '=', 'plan_quiz.plan_id')
            ->where('enrollments.student_id', $student->id)->where('enrollments.is_active', true)
            ->where('plans.space_id', $space->id)->where('plan_quiz.quiz_id', $quiz->id);
        if ($content) {
            $limits->whereExists(fn ($query) => $query->selectRaw('1')->from('accesses')
                ->whereColumn('accesses.plan_id', 'plans.id')->where('accesses.content_id', $content->id));
        }
        $values = $limits->pluck('plan_quiz.attempt_limit');
        $hasPlan = $student->enrollments()->where('is_active', true)->whereHas('plan', fn ($query) => $query->where('space_id', $space->id))->exists();

        return $values->isEmpty() ? ($content || $hasPlan ? 0 : $quiz->guest_attempt_limit)
            : ($values->contains(null) ? null : $values->max());
    }

    public function saveAnswer(User $user, Attempt $attempt, int $questionId, ?int $choiceId): void
    {
        DB::transaction(function () use ($user, $attempt, $questionId, $choiceId): void {
            $attempt = Attempt::query()->lockForUpdate()->findOrFail($attempt->id);
            abort_unless($attempt->student_id === $user->student->id, 404);
            if ($attempt->finished_at || now()->greaterThanOrEqualTo($attempt->expires_at)) {
                throw ValidationException::withMessages(['quiz' => 'زمان پاسخ‌گویی به پایان رسیده است.']);
            }
            $question = $attempt->quiz->questions()->where('questions.id', $questionId)->firstOrFail();
            $previousAnswer = DB::table('answers')->where('attempt_id', $attempt->id)->where('question_id', $questionId)->first();
            if ($choiceId === null) {
                DB::table('answers')->where('attempt_id', $attempt->id)->where('question_id', $questionId)->delete();
                if ($previousAnswer) {
                    app(ActivityLogger::class)->record('quiz.answer.deleted', properties: ['attempt_id' => $attempt->id, 'question_id' => $questionId, 'attributes' => ['choice_id' => $previousAnswer->choice_id]]);
                }

                return;
            }
            abort_unless($question->choices()->whereKey($choiceId)->exists(), 422);
            DB::table('answers')->updateOrInsert(
                ['attempt_id' => $attempt->id, 'question_id' => $questionId],
                ['choice_id' => $choiceId, 'updated_at' => now(), 'created_at' => now()],
            );
            $changes = $previousAnswer
                ? ['before' => ['choice_id' => $previousAnswer->choice_id], 'after' => ['choice_id' => $choiceId]]
                : ['attributes' => ['choice_id' => $choiceId]];
            app(ActivityLogger::class)->record('quiz.answer.saved', properties: ['attempt_id' => $attempt->id, 'question_id' => $questionId, ...$changes]);
        });
    }

    public function finish(User $user, Attempt $attempt): Attempt
    {
        return DB::transaction(function () use ($user, $attempt): Attempt {
            Student::query()->lockForUpdate()->findOrFail($user->student->id);
            $attempt = Attempt::query()->lockForUpdate()->findOrFail($attempt->id);
            abort_unless($attempt->student_id === $user->student->id, 404);
            $this->score($attempt);

            return $attempt;
        });
    }

    public function finishExpiredAttempts(): void
    {
        Attempt::query()->whereNotNull('expires_at')->where('expires_at', '<=', now())->whereNull('finished_at')
            ->orderBy('id')->chunkById(100, function ($attempts): void {
                foreach ($attempts as $item) {
                    DB::transaction(function () use ($item): void {
                        Student::query()->lockForUpdate()->findOrFail($item->student_id);
                        $attempt = Attempt::query()->lockForUpdate()->findOrFail($item->id);
                        if (! $attempt->finished_at && $attempt->expires_at && $attempt->expires_at->lessThanOrEqualTo(now())) {
                            $this->score($attempt);
                        }
                    });
                }
            });
    }

    private function finishExpired(Student $student, Quiz $quiz): void
    {
        Attempt::query()->where('student_id', $student->id)->where('quiz_id', $quiz->id)
            ->whereNotNull('expires_at')->where('expires_at', '<=', now())->whereNull('finished_at')
            ->lockForUpdate()->get()->each(fn (Attempt $attempt) => $this->score($attempt));
    }

    private function score(Attempt $attempt): void
    {
        if ($attempt->finished_at) {
            return;
        }
        $quiz = $attempt->quiz;
        $answers = DB::table('answers')->join('choices', 'choices.id', '=', 'answers.choice_id')
            ->where('answers.attempt_id', $attempt->id)->get(['choices.is_correct']);
        $correct = $answers->where('is_correct', true)->count();
        $wrong = $answers->count() - $correct;
        $questionCount = $quiz->questions()->count();
        $earned = $correct - ((float) $quiz->wrong_penalty > 0 ? $wrong / 3 : 0);
        $attempt->score = $questionCount > 0 ? round(max(0, min(100, $earned * 100 / $questionCount)), 2) : 0;
        $attempt->finished_at = now();
        $attempt->save();

        $content = Content::query()->where('contentable_type', Quiz::class)->where('contentable_id', $quiz->id)->first();
        if ($content) {
            $enrollment = $attempt->student_id
                ? DB::table('enrollments')->join('plans', 'plans.id', '=', 'enrollments.plan_id')
                    ->join('accesses', 'accesses.plan_id', '=', 'plans.id')
                    ->where('enrollments.student_id', $attempt->student_id)->where('enrollments.is_active', true)
                    ->where('plans.space_id', $quiz->space_id)->where('accesses.content_id', $content->id)
                    ->value('enrollments.id') : null;
            if ($enrollment) {
                Progress::query()->firstOrCreate(['content_id' => $content->id, 'enrollment_id' => $enrollment])
                    ->update(['status' => 'read', 'read_at' => now()]);
            }
        }

        $this->issueGrade($attempt);
    }

    public function reconcileCertificates(Student $student): void
    {
        DB::transaction(function () use ($student): void {
            Student::query()->lockForUpdate()->findOrFail($student->id);
            Attempt::query()->where('student_id', $student->id)->whereNotNull('finished_at')
                ->whereHas('quiz.space', fn ($query) => $query->whereColumn('spaces.quiz_id', 'quizzes.id'))
                ->with('quiz')->orderBy('id')->get()->each(fn (Attempt $attempt) => $this->issueGrade($attempt));
        });
    }

    private function issueGrade(Attempt $attempt): void
    {
        $quiz = $attempt->quiz;
        $space = Space::query()->whereKey($quiz->space_id)->where('quiz_id', $quiz->id)->first();
        if ($space && $quiz->passing_score !== null && $quiz->questions()->exists() && (float) $attempt->score >= (float) $quiz->passing_score) {
            $logger = app(ActivityLogger::class);
            $before = $logger->snapshot('grades', ['space_id' => $space->id, 'student_id' => $attempt->student_id], ['id', 'attempt_id']);
            $existing = DB::table('grades')->where('space_id', $space->id)->where('student_id', $attempt->student_id)->lockForUpdate()->first();
            if (! $existing) {
                DB::table('grades')->insert(['space_id' => $space->id, 'student_id' => $attempt->student_id,
                    'attempt_id' => $attempt->id, 'certificate_token' => (string) Str::uuid(), 'created_at' => now(), 'updated_at' => now()]);
            } elseif ($attempt->score > Attempt::query()->findOrFail($existing->attempt_id)->score) {
                DB::table('grades')->where('id', $existing->id)->update(['attempt_id' => $attempt->id, 'updated_at' => now()]);
            }
            $logger->recordChanges('certificate.grade.changed', $before, $logger->snapshot('grades', ['space_id' => $space->id, 'student_id' => $attempt->student_id], ['id', 'attempt_id']), $attempt);
        }
    }
}
