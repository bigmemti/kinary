<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Content;
use App\Models\Deck;
use App\Models\Enrollment;
use App\Models\Exercise;
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
                $contents = $this->contents($user, $space, false)->get();
                $readIds = $this->readIds($user, $space);
                $sections = $this->sections($contents, $readIds);
                $latest = $enrollments->sortByDesc('last_visited_at')->first();
                $lessons = collect($sections)->flatMap(fn (array $section): array => $section['lessons']);
                $firstUnreadLesson = $lessons->first(fn (array $lesson): bool => $lesson['readCount'] < $lesson['totalCount']);
                $lastLessonId = $lessons->contains('id', $latest->last_lesson_id) ? $latest->last_lesson_id : null;
                $quizService = app(QuizService::class);
                $quizContents = $this->contents($user, $space)->where('contentable_type', Quiz::class)->get();
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
    private function contents(User $user, Space $space, bool $eligibleOnly = true): Builder
    {
        $planIds = $user->student->enrollments()->where('is_active', true)
            ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->pluck('plan_id');

        return Content::query()->whereHas('lesson.section', fn (Builder $query): Builder => $query->where('course_id', $space->course_id))
            ->whereHas('accesses', fn (Builder $query): Builder => $eligibleOnly ? $this->eligibleAccesses($query, $user, $planIds) : $query->whereIn('plan_id', $planIds))
            ->with('lesson.section')->orderBy('order')->orderBy('id');
    }

    private function eligibleAccesses(Builder $query, User $user, Collection $planIds): Builder
    {
        return $query->whereIn('plan_id', $planIds)
            ->whereDoesntHave('requirements', fn (Builder $requirements): Builder => $requirements->whereNotExists(
                fn ($grades) => $grades->selectRaw('1')->from('grades')->join('attempts', 'attempts.id', '=', 'grades.attempt_id')
                    ->whereColumn('grades.space_id', 'requirements.space_id')->where('grades.student_id', $user->student->id)
                    ->join('spaces as prerequisite_spaces', 'prerequisite_spaces.id', '=', 'grades.space_id')
                    ->join('quizzes as prerequisite_quizzes', 'prerequisite_quizzes.id', '=', 'prerequisite_spaces.quiz_id')
                    ->whereColumn('attempts.quiz_id', 'prerequisite_quizzes.id')
                    ->whereNotNull('attempts.finished_at')
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

    public function authorizeLessonCommunity(User $user, Space $space, Lesson $lesson): void
    {
        $this->authorizeSpace($user, $space);
        abort_unless($this->contents($user, $space)->where('lesson_id', $lesson->id)->exists(), 404);
    }

    public function canViewLessonCommunity(User $user, Space $space, Lesson $lesson): bool
    {
        return $user->student !== null
            && $user->student->enrollments()->where('is_active', true)
                ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->exists()
            && $this->contents($user, $space)->where('lesson_id', $lesson->id)->exists();
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
        $contents = $this->contents($user, $space, false)->get();
        $allowed = $this->contents($user, $space)->get();
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
            'comments' => $allowed->contains('lesson_id', $lesson->id) ? app(CommunityService::class)->comments($lesson, $user) : [],
            'canComment' => $allowed->contains('lesson_id', $lesson->id),
            'contents' => $lessonContents->map(fn (Content $content): array => $allowed->contains('id', $content->id)
                ? $this->contentData($content, $space, $allowed, $user)
                : $this->lockedContentData($content, $space, $user))->all(),
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
            abort_unless($this->contents($user, $space, false)->where('lesson_id', $lesson->id)->exists(), 404);
            $now = now();
            foreach ($contents as $content) {
                if ($content->contentable_type === Quiz::class) {
                    continue;
                }
                $eligiblePlanIds = $this->eligibleAccesses($content->accesses()->getQuery(), $user, $enrollments->pluck('plan_id'))->pluck('plan_id');
                $enrollment = $enrollments->first(fn (Enrollment $item): bool => $eligiblePlanIds->contains($item->plan_id));
                Progress::query()->firstOrCreate(['content_id' => $content->id, 'enrollment_id' => $enrollment->id])
                    ->update(['status' => 'read', 'read_at' => $now]);
            }
            $before = $enrollments->map(fn (Enrollment $enrollment): array => $enrollment->only(['id', 'last_visited_at', 'last_lesson_id']))->all();
            $user->student->enrollments()->whereIn('id', $enrollments->modelKeys())
                ->update(['last_visited_at' => $now, 'last_lesson_id' => $lesson->id]);
            $after = $user->student->enrollments()->whereIn('id', $enrollments->modelKeys())->orderBy('id')->get()->map(fn (Enrollment $enrollment): array => $enrollment->only(['id', 'last_visited_at', 'last_lesson_id']))->all();
            app(ActivityLogger::class)->recordChanges('study.last_visit.changed', $before, $after, $lesson);
        });
    }

    /** @return array<string, mixed> */
    private function lockedContentData(Content $content, Space $space, User $user): array
    {
        $planIds = $user->student->enrollments()->where('is_active', true)
            ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->pluck('plan_id');
        $alternatives = $content->accesses()->whereIn('plan_id', $planIds)->with('requirements')->get()
            ->map(function ($access) use ($user): array {
                return $access->requirements->map(function ($requirement) use ($user): ?array {
                    $source = Space::query()->with('course')->find($requirement->space_id);
                    if (! $source || ! $source->quiz_id) {
                        return null;
                    }
                    $quiz = Quiz::query()->find($source->quiz_id);
                    $grade = DB::table('grades')->join('attempts', 'attempts.id', '=', 'grades.attempt_id')
                        ->where('grades.student_id', $user->student->id)->where('grades.space_id', $source->id)
                        ->where('attempts.quiz_id', $source->quiz_id)->whereNotNull('attempts.finished_at')->first(['attempts.score']);
                    if ($grade && (float) $grade->score >= $requirement->score) {
                        return null;
                    }
                    $limit = $quiz ? app(QuizService::class)->attemptLimit($user->student, $source, $quiz) : 0;
                    $attempts = $quiz ? $quiz->attempts()->where('student_id', $user->student->id)->count() : 0;
                    $active = $quiz && $quiz->attempts()->where('student_id', $user->student->id)->whereNull('finished_at')->where('expires_at', '>', now())->exists();

                    return ['spaceId' => $source->id, 'spaceName' => $source->name, 'courseTitle' => $source->course->title,
                        'score' => $requirement->score, 'quizId' => $source->quiz_id,
                        'canStart' => $source->course->is_published && $quiz && $quiz->questions()->exists() && ($active || $limit === null || $attempts < $limit)];
                })->filter()->values()->all();
            })->all();

        return ['id' => $content->id, 'description' => '', 'type' => 'locked', 'requirementAlternatives' => $alternatives];
    }

    /** @param list<int> $visited
     * @return array<string, mixed>
     */
    private function contentData(Content $content, Space $space, Collection $allowed, User $user, array $visited = []): array
    {
        $types = [TextContent::class, ImageContent::class, VideoContent::class, FileContent::class, TableContent::class, RemindContent::class, Quiz::class, Assignment::class, Exercise::class, Deck::class];
        $record = in_array($content->contentable_type, $types, true) ? $content->contentable : null;
        $data = ['id' => $content->id, 'description' => $content->description, 'type' => 'unavailable'];

        if ($record instanceof Deck) {
            return [...$data, 'type' => 'deck', 'name' => $record->name,
                'cards' => $record->cards()->get(['id', 'question', 'answer'])->toArray(),
                'personalDecks' => DB::table('decks')->where('is_personal', true)
                    ->whereIn('id', DB::table('deck_student')->where('student_id', $user->student->id)->select('deck_id'))
                    ->orderBy('name')->get(['id', 'name'])->toArray()];
        } elseif ($record instanceof Exercise) {
            $planIds = $user->student->enrollments()->where('is_active', true)
                ->whereHas('plan', fn (Builder $query): Builder => $query->where('space_id', $space->id))->pluck('plan_id');
            $accesses = $this->eligibleAccesses($content->accesses()->getQuery(), $user, $planIds)->get();

            return [...$data, 'type' => 'exercise', 'body' => $record->question,
                'answer' => $accesses->contains('answer_release', 'always') ? $record->answer : null,
                'answerVideoUrl' => $accesses->contains('answer_video_release', 'always') ? $record->answer_video_url : null];
        } elseif ($record instanceof Assignment) {
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
            $target = Content::query()->with('lesson.section.course')->find($record->content_id);
            if ($target && ! in_array($target->id, [...$visited, $content->id], true)) {
                $safeTypes = [TextContent::class, ImageContent::class, VideoContent::class, FileContent::class, TableContent::class];
                if (! in_array($target->contentable_type, $safeTypes, true)) {
                    $legacy = $allowed->firstWhere('id', $target->id);

                    return $legacy ? [...$data, 'type' => 'remind', 'target' => $this->contentData($legacy, $space, $allowed, $user, [...$visited, $content->id])] : $data;
                }
                $targetData = $this->contentData($target, $space, $allowed, $user, [...$visited, $content->id]);
                if ($target->contentable_type === FileContent::class) {
                    $targetData['url'] = route('student.study.reminder-download', [$space, $content]);
                }
                $planIds = $user->student->enrollments()->where('is_active', true)->pluck('plan_id');
                $access = $this->eligibleAccesses($target->accesses()->getQuery(), $user, $planIds)->with('plan.space')->first();
                $sourceCourse = $target->lesson->section->course;

                return [...$data, 'type' => 'remind', 'target' => $targetData,
                    'sourceCourse' => $sourceCourse->title, 'sourceLesson' => $target->lesson->name,
                    'sourceUrl' => $access ? route('student.study.lesson', [$access->plan->space, $target->lesson]).'#content-'.$target->id
                        : ($sourceCourse->is_published ? route('course.show', ['course' => $sourceCourse->slug, 'reminder' => $target->id]).'#course-learning' : null),
                    'sourceAccessible' => (bool) $access];
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
                VideoContent::class => preg_match('~^(?:embed:)?https?://~i', $record->path) ? $record->path : null,
                default => route('student.study.download', [$space, $content]),
            }];
        }

        return $data;
    }
}
