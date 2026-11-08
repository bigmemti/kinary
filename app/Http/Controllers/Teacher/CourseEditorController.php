<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\TeacherRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\UpdateCourseTeachersRequest;
use App\Http\Requests\Teacher\UpdateEditorCourseRequest;
use App\Models\Assignment;
use App\Models\Category;
use App\Models\Content;
use App\Models\Course;
use App\Models\Deck;
use App\Models\Exercise;
use App\Models\FileContent;
use App\Models\ImageContent;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Quiz;
use App\Models\RemindContent;
use App\Models\Section;
use App\Models\Space;
use App\Models\TableContent;
use App\Models\Teacher;
use App\Models\TextContent;
use App\Models\VideoContent;
use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CourseEditorController extends Controller
{
    public function __invoke(Course $course): Response
    {
        Gate::authorize('viewEditor', $course);

        return Inertia::render('teacher/course/editor', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'is_published' => (bool) $course->is_published,
            ],
            'overview' => Inertia::defer(fn (): array => $this->overview($course)),
            'createdItem' => session('editor_created'),
            'returnTo' => session('editor_return'),
        ]);
    }

    public function updateInformation(UpdateEditorCourseRequest $request, Course $course): RedirectResponse
    {
        $storedPath = null;

        try {
            DB::transaction(function () use ($request, $course, &$storedPath): void {
                $lockedCourse = Course::query()->lockForUpdate()->findOrFail($course->id);
                Gate::authorize('updateEditorInformation', $lockedCourse);

                if ($request->exists('is_published')) {
                    Gate::authorize('publishEditorCourse', $lockedCourse);
                }

                $data = $request->safe()->except('thumbnail_file');
                if ($request->hasFile('thumbnail_file')) {
                    $storedPath = $request->file('thumbnail_file')->store("courses/{$course->id}/covers", 'public');
                    if ($storedPath === false) {
                        throw ValidationException::withMessages(['thumbnail_file' => 'بارگذاری تصویر انجام نشد. دوباره تلاش کنید.']);
                    }
                    $data['thumbnail'] = Storage::disk('public')->url($storedPath);
                }

                $lockedCourse->update($data);
            });
        } catch (Throwable $exception) {
            if ($storedPath) {
                Storage::disk('public')->delete($storedPath);
            }
            throw $exception;
        }

        return to_route('teacher.course.editor', $course);
    }

    public function updateTeachers(UpdateCourseTeachersRequest $request, Course $course): RedirectResponse
    {
        DB::transaction(function () use ($request, $course): void {
            $lockedCourse = Course::query()->lockForUpdate()->findOrFail($course->id);
            Gate::authorize('manageEditorTeachers', $lockedCourse);

            $teachers = collect($request->validated('teachers'))->mapWithKeys(fn (array $teacher): array => [
                $teacher['id'] => ['role' => $teacher['role']],
            ]);
            $logger = app(ActivityLogger::class);
            $before = $logger->snapshot('course_teacher', ['course_id' => $course->id], ['teacher_id', 'role']);
            $lockedCourse->teachers()->sync($teachers->all());
            $logger->recordChanges('course.teachers.changed', $before, $logger->snapshot('course_teacher', ['course_id' => $course->id], ['teacher_id', 'role']), $lockedCourse);
        });

        return Gate::allows('viewEditor', $course)
            ? to_route('teacher.course.editor', $course)
            : to_route('teacher.course.index');
    }

    /**
     * @return array{
     *     slug: string, description: ?string, thumbnail: ?string, intro_video_url: ?string,
     *     sections_count: int, spaces_count: int,
     *     permissions: array{update_information: bool, publish: bool, manage_teachers: bool, manage_commerce: bool, update_structure: bool, delete_structure: bool},
     *     has_owner: bool, available_teachers: list<array{id: int, name: string}>,
     *     teachers: list<array{id: int, name: string, role: string, created_at: ?string, updated_at: ?string}>,
     *     sections: list<array{id: int, name: string, order: int, lessons: list<array{id: int, name: string, order: int, thumbnail: ?string, thumbnail_url: ?string, images: list<array{path: string, url: string}>, pricings: list<array{plan_id: int, price: int}>, contents: list<array<string, mixed>>}>}>,
     *     spaces: list<array{id: int, name: string, quiz_id: ?int, delete_block_reason: ?string, plans: list<array{id: int, name: string, price: int, order: int, enrollments_count: int, orders_count: int, delete_block_reason: ?string}>}>,
     *     available_quizzes: list<array{id: int, score: int, time: string}>
     * }
     */
    private function overview(Course $course): array
    {
        $course->loadCount(['sections', 'spaces']);

        $sections = $course->sections()
            ->orderBy('order')->orderBy('id')
            ->with([
                'lessons' => fn (HasMany $query) => $query
                    ->select(['id', 'section_id', 'name', 'order', 'thumbnail', 'images'])->orderBy('order')->orderBy('id'),
                'lessons.pricings',
                'lessons.contents' => fn (HasMany $query) => $query
                    ->select(['id', 'lesson_id', 'description', 'order', 'contentable_type', 'contentable_id'])->orderBy('order')->orderBy('id')
                    ->with(['accesses.requirements']),
            ])
            ->get(['id', 'course_id', 'parent_id', 'name', 'order']);

        $contents = new Collection($sections->flatMap(fn (Section $section) => $section->lessons->flatMap(fn (Lesson $lesson) => $lesson->contents))->all());
        $supportedTypes = [TextContent::class, ImageContent::class, VideoContent::class, FileContent::class, TableContent::class, RemindContent::class, Quiz::class, Assignment::class];
        $contents->reject(fn (Content $content): bool => in_array($content->contentable_type, $supportedTypes, true))
            ->each(fn (Content $content) => $content->setRelation('contentable', null));
        $contents->filter(fn (Content $content): bool => in_array($content->contentable_type, $supportedTypes, true))->load('contentable');
        $contents->filter(fn (Content $content): bool => $content->contentable_type === RemindContent::class)->load('contentable.target.lesson.section.course');

        $teachers = $course->teachers()
            ->with('user:id,name')
            ->orderBy('teachers.id')
            ->get(['teachers.id', 'teachers.user_id']);

        $canManageTeachers = Gate::allows('manageEditorTeachers', $course);
        $availableTeachers = $canManageTeachers
            ? Teacher::query()->whereHas('user', fn (Builder $query) => $query->role('teacher'))
                ->with('user:id,name')->orderBy('id')->get(['id', 'user_id'])
                ->map(fn (Teacher $teacher): array => ['id' => $teacher->id, 'name' => $teacher->user->name])->all()
            : [];

        $spaces = $course->spaces()->orderBy('id')->with(['categories:id,name', 'plans' => fn (HasMany $query) => $query->orderBy('order')->orderBy('id')->withCount(['enrollments', 'orders'])])->get();

        return [
            'reminder_source_url' => route('teacher.course.editor.reminder-sources', $course),
            'available_categories' => Category::query()->orderBy('name')->get(['id', 'name'])->toArray(),
            'requirement_spaces' => Gate::allows('manageEditorCommerce', $course)
                ? Space::query()->whereNotNull('quiz_id')->with('course:id,title')->orderBy('id')->get(['id', 'name', 'course_id', 'quiz_id'])
                    ->map(fn (Space $space): array => ['id' => $space->id, 'name' => $space->name, 'course_title' => $space->course->title])->all()
                : [],
            'slug' => $course->slug,
            'description' => $course->description,
            'thumbnail' => $course->thumbnail,
            'intro_video_url' => $course->intro_video_url,
            'sections_count' => $course->sections_count,
            'spaces_count' => $course->spaces_count,
            'permissions' => [
                'update_information' => Gate::allows('updateEditorInformation', $course),
                'publish' => Gate::allows('publishEditorCourse', $course),
                'manage_teachers' => $canManageTeachers,
                'manage_commerce' => Gate::allows('manageEditorCommerce', $course),
                'update_structure' => Gate::allows('updateEditorStructure', $course),
                'delete_structure' => Gate::allows('deleteEditorStructure', $course),
            ],
            'has_owner' => $teachers->contains(fn (Teacher $teacher): bool => $teacher->pivot->role === TeacherRole::Owner->value),
            'available_teachers' => $availableTeachers,
            'sections' => $sections->map(fn (Section $section): array => [
                'parent_id' => $section->parent_id,
                'id' => $section->id,
                'name' => $section->name,
                'order' => (int) $section->order,
                'lessons' => $section->lessons->map(fn (Lesson $lesson): array => [
                    'id' => $lesson->id,
                    'name' => $lesson->name,
                    'order' => (int) $lesson->order,
                    'thumbnail' => $lesson->thumbnail,
                    'thumbnail_url' => $lesson->thumbnail ? Storage::disk('public')->url($lesson->thumbnail) : null,
                    'images' => collect($lesson->images ?? [])->map(fn (string $path): array => ['path' => $path, 'url' => Storage::disk('public')->url($path)])->all(),
                    'pricings' => $lesson->pricings->map(fn ($pricing): array => ['plan_id' => $pricing->plan_id, 'price' => $pricing->price])->all(),
                    'contents' => $lesson->contents->map(fn (Content $content): array => [
                        'id' => $content->id,
                        'description' => $content->description,
                        'order' => (int) $content->order,
                        'type' => match ($content->contentable_type) {
                            TextContent::class => 'text',
                            ImageContent::class => 'image',
                            VideoContent::class => 'video',
                            FileContent::class => 'file',
                            TableContent::class => 'table',
                            RemindContent::class => 'remind',
                            Quiz::class => 'quiz',
                            Assignment::class => 'homework',
                            Exercise::class => 'exercise',
                            Deck::class => 'deck',
                            default => 'unknown',
                        },
                        'body' => $content->contentable instanceof Exercise ? $content->contentable->question : ($content->contentable instanceof TextContent || $content->contentable instanceof Assignment ? $content->contentable->body : null),
                        'allowed_extensions' => $content->contentable instanceof Assignment ? implode(', ', $content->contentable->allowed_extensions ?? []) : '',
                        'answer_body' => $content->contentable instanceof Exercise ? $content->contentable->answer : ($content->contentable instanceof Assignment ? $content->contentable->answer_body : null),
                        'answer_video_url' => ($content->contentable instanceof Assignment || $content->contentable instanceof Exercise) ? $content->contentable->answer_video_url : null,
                        'name' => $content->contentable instanceof ImageContent || $content->contentable instanceof VideoContent || $content->contentable instanceof FileContent || $content->contentable instanceof Deck ? $content->contentable->name : null,
                        'cards' => $content->contentable instanceof Deck ? $content->contentable->cards()->get(['id', 'question', 'answer'])->toArray() : [],
                        'url' => match (true) {
                            $content->contentable instanceof ImageContent => Storage::disk('public')->url($content->contentable->path),
                            $content->contentable instanceof VideoContent => str_starts_with($content->contentable->path, 'embed:')
                                ? '<iframe src="'.htmlspecialchars(substr($content->contentable->path, 6), ENT_QUOTES).'"></iframe>'
                                : $content->contentable->path,
                            $content->contentable instanceof FileContent => route('teacher.content.editor.download', $content),
                            default => null,
                        },
                        'table' => $content->contentable instanceof TableContent ? $content->contentable->table : null,
                        'remind_content_id' => $content->contentable instanceof RemindContent ? $content->contentable->content_id : null,
                        'remind_target_label' => $content->contentable instanceof RemindContent && $content->contentable->target
                            ? $content->contentable->target->lesson->section->course->title.' / '.$content->contentable->target->lesson->name.' / '.($content->contentable->target->description ?: 'محتوای انتخاب‌شده') : null,
                        'quiz_space_id' => $content->contentable instanceof Quiz ? $content->contentable->space_id : null,
                        'accesses' => $content->accesses->map(fn ($access): array => [
                            'plan_id' => $access->plan_id,
                            'answer_release' => $access->answer_release,
                            'answer_video_release' => $access->answer_video_release,
                            'requirements' => $access->requirements->map(fn ($requirement): array => ['space_id' => $requirement->space_id, 'score' => $requirement->score])->values()->all(),
                        ])->values()->all(),
                        'delete_block_reason' => $content->deletionBlockReason(),
                    ])->all(),
                ])->all(),
            ])->all(),
            'teachers' => $teachers->map(fn (Teacher $teacher): array => [
                'id' => $teacher->id,
                'name' => $teacher->user->name,
                'role' => $teacher->pivot->role,
                'created_at' => $teacher->pivot->created_at?->toISOString(),
                'updated_at' => $teacher->pivot->updated_at?->toISOString(),
            ])->all(),
            'spaces' => $spaces->map(fn (Space $space): array => [
                'id' => $space->id, 'name' => $space->name, 'quiz_id' => $space->quiz_id,
                'categories' => $space->categories->map(fn (Category $category): array => ['id' => $category->id, 'name' => $category->name])->all(),
                'delete_block_reason' => $space->deletionBlockReason(),
                'plans' => $space->plans->map(fn (Plan $plan): array => [
                    'id' => $plan->id, 'name' => $plan->name, 'description' => $plan->description, 'price' => $plan->price, 'order' => $plan->order,
                    'enrollments_count' => $plan->enrollments_count, 'orders_count' => $plan->orders_count,
                    'delete_block_reason' => $plan->deletionBlockReason(),
                ])->all(),
            ])->all(),
            'available_quizzes' => Gate::allows('manageEditorCommerce', $course)
                ? Quiz::query()->whereIn('id', $spaces->pluck('quiz_id')->filter())->orderBy('id')->get(['id', 'score', 'time'])->toArray() : [],
        ];
    }
}
