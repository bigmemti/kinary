<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Content;
use App\Models\Enrollment;
use App\Models\FileContent;
use App\Models\ImageContent;
use App\Models\Lesson;
use App\Models\Progress;
use App\Models\Quiz;
use App\Models\RemindContent;
use App\Models\Space;
use App\Models\TableContent;
use App\Models\TextContent;
use App\Models\User;
use App\Models\VideoContent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StudyService
{
    /** @return list<array<string, mixed>> */
    public function library(User $user): array
    {
        return $user->student->enrollments()->where('is_active', true)->with('plan.space.course')->get()
            ->groupBy('plan.space_id')->map(function (Collection $enrollments) use ($user): array {
                $space = $enrollments->first()->plan->space;
                $contents = $this->contents($user, $space)->get();
                $readIds = $this->readIds($user, $space);
                $sections = $this->sections($contents, $readIds);
                $latest = $enrollments->sortByDesc('last_visited_at')->first();
                $lessons = collect($sections)->flatMap(fn (array $section): array => $section['lessons']);
                $firstUnreadLesson = $lessons->first(fn (array $lesson): bool => $lesson['readCount'] < $lesson['totalCount']);
                $lastLessonId = $lessons->contains('id', $latest->last_lesson_id) ? $latest->last_lesson_id : null;
                $quizService = app(QuizService::class);
                $quizContents = $contents->where('contentable_type', Quiz::class);
                $quizzes = Quiz::query()->where('space_id', $space->id)
                    ->whereIn('id', $quizContents->pluck('contentable_id')->push($space->quiz_id)->filter())->get();
                $examData = $quizzes->map(function ($quiz) use ($quizContents, $space, $user, $quizService): array {
                    $content = $quizContents->firstWhere('contentable_id', $quiz->id);
                    $attempts = $quiz->attempts()->where('student_id', $user->student->id)->orderByDesc('id')->get();
                    $limit = $quizService->attemptLimit($user->student, $space, $quiz, $content);

                    return [
                        'id' => $quiz->id, 'title' => $quiz->title, 'contentId' => $content?->id,
                        'final' => $space->quiz_id === $quiz->id, 'limit' => $limit,
                        'canStart' => ($limit === null || $attempts->count() < $limit) && $quiz->questions()->exists() && ($content || $space->course->is_published),
                        'attempts' => $attempts->map(fn ($attempt) => [
                            'id' => $attempt->id, 'startedAt' => $attempt->started_at?->toISOString(),
                            'finished' => (bool) $attempt->finished_at, 'score' => $attempt->finished_at ? $attempt->score : null,
                        ])->all(),
                    ];
                })->values()->all();

                return [
                    'id' => $space->id,
                    'name' => $space->name,
                    'courseTitle' => $space->course->title,
                    'plans' => $enrollments->pluck('plan.name')->unique()->values()->all(),
                    'lastVisitedAt' => $latest->last_visited_at,
                    'resumeLessonId' => $firstUnreadLesson['id'] ?? $lastLessonId ?? $lessons->first()['id'] ?? null,
                    'sections' => $sections,
                    'quizzes' => $examData,
                    ...$this->progress($contents, $readIds),
                ];
            })->sortByDesc('lastVisitedAt')->values()->all();
    }

    /** @return Builder<Content> */
    private function contents(User $user, Space $space): Builder
    {
        $planIds = $user->student->enrollments()->where('is_active', true)
            ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->pluck('plan_id');

        return Content::query()->whereHas('lesson.section', fn (Builder $query): Builder => $query->where('course_id', $space->course_id))
            ->whereHas('accesses', fn (Builder $query): Builder => $this->eligibleAccesses($query, $user, $planIds))
            ->with('lesson.section')->orderBy('order')->orderBy('id');
    }

    private function eligibleAccesses(Builder $query, User $user, Collection $planIds): Builder
    {
        return $query->whereIn('plan_id', $planIds)
            ->whereDoesntHave('requirements', fn (Builder $requirements): Builder => $requirements->whereNotExists(
                fn ($grades) => $grades->selectRaw('1')->from('grades')->join('attempts', 'attempts.id', '=', 'grades.attempt_id')
                    ->whereColumn('grades.space_id', 'requirements.space_id')->where('grades.student_id', $user->student->id)
                    ->whereColumn('attempts.score', '>=', 'requirements.score')
            ));
    }

    private function answerVisible(string $release, bool $submitted, bool $approved): bool
    {
        return match ($release) {
            'always' => true,
            'submitted' => $submitted,
            'approved' => $approved,
            default => false,
        };
    }

    private function authorizeSpace(User $user, Space $space): void
    {
        abort_unless($user->student?->enrollments()->where('is_active', true)
            ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->exists(), 404);
    }

    public function authorizeContent(User $user, Space $space, Content $content): void
    {
        $this->authorizeSpace($user, $space);
        abort_unless($this->contents($user, $space)->whereKey($content->id)->exists(), 404);
    }

    /** @return Collection<int, int> */
    private function readIds(User $user, Space $space): Collection
    {
        $enrollmentIds = $user->student->enrollments()
            ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->pluck('id');

        return Progress::query()->whereIn('enrollment_id', $enrollmentIds)->where('status', 'read')
            ->distinct()->pluck('content_id');
    }

    /** @return array{readCount: int, totalCount: int, percentage: int} */
    private function progress(Collection $contents, Collection $readIds): array
    {
        $total = $contents->count();
        $read = $contents->whereIn('id', $readIds)->count();

        return ['readCount' => $read, 'totalCount' => $total, 'percentage' => $total > 0 ? (int) floor($read * 100 / $total) : 0];
    }

    /** @return list<array<string, mixed>> */
    private function sections(Collection $contents, Collection $readIds): array
    {
        if ($contents->isEmpty()) {
            return [];
        }
        $visible = $contents->groupBy('lesson.section_id')->map(function (Collection $sectionContents) use ($readIds): array {
            $section = $sectionContents->first()->lesson->section;

            return [
                'id' => $section->id, 'parent_id' => $section->parent_id, 'name' => $section->name, 'order' => $section->order,
                'lessons' => $sectionContents->groupBy('lesson_id')->map(function (Collection $lessonContents) use ($readIds): array {
                    $lesson = $lessonContents->first()->lesson;

                    return ['id' => $lesson->id, 'name' => $lesson->name, 'order' => $lesson->order, ...$this->progress($lessonContents, $readIds)];
                })->sortBy([['order', 'asc'], ['id', 'asc']])->values()->all(),
            ];
        });
        $course = $contents->first()->lesson->section->course;
        $sections = $course->sections()->orderBy('order')->orderBy('id')->get()->map(fn ($section): array => $visible->get($section->id) ?? [
            'id' => $section->id, 'parent_id' => $section->parent_id, 'name' => $section->name, 'order' => $section->order, 'lessons' => [],
        ])->all();

        return app(SectionTree::class)->visible($sections);
    }

    /** @return array<string, mixed> */
    public function lessonData(User $user, Space $space, Lesson $lesson): array
    {
        $this->authorizeSpace($user, $space);
        $contents = $this->contents($user, $space)->get();
        $lessonContents = $contents->where('lesson_id', $lesson->id)->values();
        abort_if($lessonContents->isEmpty(), 404);
        $readIds = $this->readIds($user, $space);
        $sections = $this->sections($contents, $readIds);
        $lessons = collect($sections)->flatMap(fn (array $section): array => $section['lessons'])->values();
        $position = $lessons->search(fn (array $item): bool => $item['id'] === $lesson->id);

        return [
            'space' => ['id' => $space->id, 'name' => $space->name, 'courseTitle' => $space->course->title, ...$this->progress($contents, $readIds)],
            'sections' => $sections,
            'lesson' => ['id' => $lesson->id, 'name' => $lesson->name, 'sectionName' => $lesson->section->name],
            'contents' => $lessonContents->map(fn (Content $content): array => $this->contentData($content, $space, $contents, $user))->all(),
            'previousLesson' => $lessons->get($position - 1),
            'nextLesson' => $lessons->get($position + 1),
        ];
    }

    public function visit(User $user, Space $space, Lesson $lesson): void
    {
        $this->authorizeSpace($user, $space);
        DB::transaction(function () use ($user, $space, $lesson): void {
            $enrollments = $user->student->enrollments()->where('is_active', true)
                ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->lockForUpdate()->get();
            $contents = $this->contents($user, $space)->where('lesson_id', $lesson->id)->with('accesses')->get();
            abort_if($contents->isEmpty(), 404);
            $now = now();
            foreach ($contents as $content) {
                if ($content->contentable_type === Quiz::class) {
                    continue;
                }
                $enrollment = $enrollments->first(fn (Enrollment $item): bool => $content->accesses->contains('plan_id', $item->plan_id));
                Progress::query()->firstOrCreate(['content_id' => $content->id, 'enrollment_id' => $enrollment->id])
                    ->update(['status' => 'read', 'read_at' => $now]);
            }
            $user->student->enrollments()->whereIn('id', $enrollments->modelKeys())
                ->update(['last_visited_at' => $now, 'last_lesson_id' => $lesson->id]);
        });
    }

    /** @param list<int> $visited
     * @return array<string, mixed>
     */
    private function contentData(Content $content, Space $space, Collection $allowed, User $user, array $visited = []): array
    {
        $types = [TextContent::class, ImageContent::class, VideoContent::class, FileContent::class, TableContent::class, RemindContent::class, Quiz::class, Assignment::class];
        $record = in_array($content->contentable_type, $types, true) ? $content->contentable : null;
        $data = ['id' => $content->id, 'description' => $content->description, 'type' => 'unavailable'];

        if ($record instanceof Assignment) {
            $submission = DB::table('submissions')->where('assignment_id', $record->id)->where('student_id', $user->student->id)->first();
            $planIds = $user->student->enrollments()->where('is_active', true)
                ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->pluck('plan_id');
            $accesses = $this->eligibleAccesses($content->accesses()->getQuery(), $user, $planIds)->get();
            $submitted = $submission !== null;
            $approved = $submission?->approved_at !== null;
            $showText = $accesses->contains(fn ($access): bool => $this->answerVisible($access->answer_release, $submitted, $approved));
            $showVideo = $accesses->contains(fn ($access): bool => $this->answerVisible($access->answer_video_release, $submitted, $approved));

            return [...$data, 'type' => 'homework', 'body' => $record->body, 'extensions' => array_values(array_unique([...($record->allowed_extensions ?? []), 'zip'])), 'submission' => $submission ? [
                'approved' => $submission->approved_at !== null, 'score' => $submission->score, 'note' => $submission->note,
                'files' => DB::table('submission_files')->where('submission_id', $submission->id)->pluck('name')->all(),
            ] : null, 'answer' => $showText ? $record->answer_body : null, 'answerVideoUrl' => $showVideo ? $record->answer_video_url : null];
        } elseif ($record instanceof Quiz && $record->space_id === $space->id) {
            $latest = $record->attempts()->where('student_id', $user->student->id)->whereNotNull('finished_at')->latest('finished_at')->first();

            return [...$data, 'type' => 'quiz', 'name' => $record->title, 'quizId' => $record->id, 'body' => $record->description, 'latestScore' => $latest?->score];
        } elseif ($record instanceof RemindContent) {
            $target = $allowed->firstWhere('id', $record->content_id);
            if ($target && ! in_array($target->id, [...$visited, $content->id], true)) {
                return [...$data, 'type' => 'remind', 'target' => $this->contentData($target, $space, $allowed, $user, [...$visited, $content->id])];
            }
        } elseif ($record instanceof TextContent) {
            return [...$data, 'type' => 'text', 'body' => $record->body];
        } elseif ($record instanceof TableContent) {
            return [...$data, 'type' => 'table', 'rows' => $record->table];
        } elseif ($record instanceof ImageContent || $record instanceof VideoContent || $record instanceof FileContent) {
            return [...$data, 'name' => $record->name, 'type' => match ($record::class) {
                ImageContent::class => 'image', VideoContent::class => 'video', default => 'file',
            }, 'url' => match ($record::class) {
                ImageContent::class => Storage::disk('public')->url($record->path),
                VideoContent::class => preg_match('~^https?://~i', $record->path) ? $record->path : null,
                default => route('student.study.download', [$space, $content]),
            }];
        }

        return $data;
    }
}
