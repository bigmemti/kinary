<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\Content;
use App\Models\Quiz;
use App\Models\Space;
use App\Services\QuizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class QuizController extends Controller
{
    public function start(Request $request, Space $space, Quiz $quiz, QuizService $service): RedirectResponse
    {
        $content = $request->integer('content') ? Content::query()->findOrFail($request->integer('content')) : null;
        $attempt = $service->start($request->user(), $space, $quiz, $content);

        return to_route('student.quiz.show', $attempt);
    }

    public function show(Request $request, Attempt $attempt, QuizService $service): Response|RedirectResponse
    {
        abort_unless($attempt->student_id === $request->user()->student->id, 404);
        if (! $attempt->finished_at && $attempt->expires_at && now()->greaterThanOrEqualTo($attempt->expires_at)) {
            $attempt = $service->finish($request->user(), $attempt);
        }
        $quiz = $attempt->quiz;
        $content = Content::query()->where('contentable_type', Quiz::class)->where('contentable_id', $quiz->id)->first();
        $service->authorizeQuiz($request->user(), Space::query()->findOrFail($quiz->space_id), $quiz, $content);
        if ($attempt->finished_at && ! $content) {
            $service->reconcileCertificates($request->user()->student);
        }
        $certificate = DB::table('grades')->where('space_id', $quiz->space_id)
            ->where('student_id', $request->user()->student->id)->value('certificate_token');

        return inertia('student/quiz/show', [
            'attempt' => ['id' => $attempt->id, 'expiresAt' => $attempt->expires_at?->toISOString(), 'finished' => (bool) $attempt->finished_at, 'score' => $attempt->finished_at ? $attempt->score : null],
            'quiz' => ['title' => $quiz->title, 'description' => $quiz->description],
            'certificateUrl' => ! $content && $certificate ? route('certificate.show', $certificate) : null,
            'backUrl' => $content ? route('student.study.lesson', [$quiz->space_id, $content->lesson_id]) : route('course.show', $quiz->space->course->slug),
            'questions' => $attempt->finished_at ? [] : $quiz->questions()->with('choices')->get()->map(fn ($question) => [
                'id' => $question->id, 'body' => $question->body,
                'choices' => $question->choices->map(fn ($choice) => ['id' => $choice->id, 'body' => $choice->body]),
                'selected' => DB::table('answers')->where('attempt_id', $attempt->id)->where('question_id', $question->id)->value('choice_id'),
            ]),
        ]);
    }

    public function answer(Request $request, Attempt $attempt, QuizService $service): JsonResponse
    {
        $data = $request->validate(['question_id' => 'required|integer', 'choice_id' => 'nullable|integer']);
        $service->saveAnswer($request->user(), $attempt, $data['question_id'], $data['choice_id'] ?? null);

        return response()->json(['saved' => true]);
    }

    public function finish(Request $request, Attempt $attempt, QuizService $service): RedirectResponse
    {
        $service->finish($request->user(), $attempt);

        return to_route('student.quiz.show', $attempt);
    }
}
