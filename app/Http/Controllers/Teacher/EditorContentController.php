<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\SaveEditorContentRequest;
use App\Models\Content;
use App\Models\Course;
use App\Models\FileContent;
use App\Models\ImageContent;
use App\Models\Lesson;
use App\Models\RemindContent;
use App\Models\TableContent;
use App\Models\TextContent;
use App\Models\VideoContent;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class EditorContentController extends Controller
{
    private const TYPE_CLASSES = [
        'text' => TextContent::class,
        'image' => ImageContent::class,
        'video' => VideoContent::class,
        'file' => FileContent::class,
        'table' => TableContent::class,
        'remind' => RemindContent::class,
    ];

    public function download(Content $content): StreamedResponse
    {
        $course = $content->lesson?->section?->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);
        $file = $this->typeRecord($content);
        abort_unless($file instanceof FileContent && Storage::disk('local')->exists($file->path), 404);

        $name = str_replace(['/', '\\', "\r", "\n"], '_', $file->name);

        return Storage::disk('local')->download($file->path, $name, ['X-Content-Type-Options' => 'nosniff']);
    }

    public function store(SaveEditorContentRequest $request, Lesson $lesson): RedirectResponse
    {
        $storedFiles = [];
        $content = null;

        try {
            DB::transaction(function () use ($request, $lesson, &$storedFiles, &$content): void {
                $course = Course::query()->lockForUpdate()->findOrFail($lesson->section->course_id);
                Gate::authorize('updateEditorStructure', $course);

                $nextOrder = (int) Content::query()->where('lesson_id', $lesson->id)->max('order') + 1;
                if ($nextOrder > 32767) {
                    throw ValidationException::withMessages(['type' => 'تعداد محتواهای این درس به حداکثر رسیده است.']);
                }

                $obsoleteFiles = [];
                $record = new (self::TYPE_CLASSES[$request->validated('type')]);
                $this->fillTypeRecord($request, $course, $record, $storedFiles, $obsoleteFiles, null);
                $content = Content::query()->create([
                    'lesson_id' => $lesson->id,
                    'description' => (string) $request->validated('description'),
                    'order' => $nextOrder,
                    'contentable_type' => $record::class,
                    'contentable_id' => $record->id,
                ]);

                $this->syncAccesses($request, $course, $content);
            });
        } catch (Throwable $exception) {
            $this->deleteStoredFiles($storedFiles);
            throw $exception;
        }

        return to_route('teacher.course.editor', $lesson->section->course_id)->with('editor_created', [
            'kind' => 'content',
            'id' => $content->id,
            'parent_id' => $lesson->id,
        ]);
    }

    public function update(SaveEditorContentRequest $request, Content $content): RedirectResponse
    {
        $storedFiles = [];
        $obsoleteFiles = [];
        $courseId = $content->lesson->section->course_id;

        try {
            DB::transaction(function () use ($request, $content, $courseId, &$storedFiles, &$obsoleteFiles): void {
                $course = Course::query()->lockForUpdate()->findOrFail($courseId);
                Gate::authorize('updateEditorStructure', $course);
                $content = Content::query()->lockForUpdate()->findOrFail($content->id);
                $current = $this->typeRecord($content);
                $targetClass = self::TYPE_CLASSES[$request->validated('type')];
                $record = ($current !== null && $current::class === $targetClass) ? $current : new $targetClass;

                $this->fillTypeRecord($request, $course, $record, $storedFiles, $obsoleteFiles, $content);

                if ($record !== $current) {
                    $obsoleteFiles = array_merge($obsoleteFiles, $current ? $this->recordFiles($current) : []);
                    $content->update(['contentable_type' => $record::class, 'contentable_id' => $record->id]);
                    $current?->delete();
                }

                $content->update(['description' => (string) $request->validated('description')]);

                $this->syncAccesses($request, $course, $content);
            });
        } catch (Throwable $exception) {
            $this->deleteStoredFiles($storedFiles);
            throw $exception;
        }

        $this->deleteStoredFiles($obsoleteFiles);

        return to_route('teacher.course.editor', $courseId);
    }

    public function destroy(Content $content): RedirectResponse
    {
        $courseId = $content->lesson?->section?->course_id;
        abort_unless($courseId, 404);
        $obsoleteFiles = [];

        DB::transaction(function () use ($content, $courseId, &$obsoleteFiles): void {
            $course = Course::query()->lockForUpdate()->findOrFail($courseId);
            Gate::authorize('deleteEditorStructure', $course);
            $content = Content::query()->lockForUpdate()->findOrFail($content->id);

            if ($reason = $content->deletionBlockReason()) {
                throw ValidationException::withMessages(['content' => $reason]);
            }

            DB::table('requirements')->whereIn('access_id', $content->accesses()->select('id'))->delete();
            $content->accesses()->delete();
            $record = $this->typeRecord($content);
            $content->delete();

            if ($record !== null) {
                $obsoleteFiles = $this->recordFiles($record);
                $record->delete();
            }
        });

        $this->deleteStoredFiles($obsoleteFiles);

        return to_route('teacher.course.editor', $courseId);
    }

    /**
     * @param  list<array{disk: string, path: string}>  $storedFiles
     * @param  list<array{disk: string, path: string}>  $obsoleteFiles
     */
    private function fillTypeRecord(SaveEditorContentRequest $request, Course $course, Model $record, array &$storedFiles, array &$obsoleteFiles, ?Content $content): void
    {
        $type = $request->validated('type');

        if ($type === 'text') {
            $record->body = $request->validated('body');
        } elseif ($type === 'video') {
            $record->name = $request->validated('name');
            $record->path = $request->validated('url');
        } elseif ($type === 'table') {
            $record->table = array_values(array_map(fn (array $row): array => array_values($row), $request->validated('table')));
        } elseif ($type === 'remind') {
            $this->assertRemindTarget((int) $request->validated('content_id'), $course, $content);
            $record->content_id = (int) $request->validated('content_id');
        } else {
            $isImage = $type === 'image';
            $field = $isImage ? 'image_file' : 'content_file';
            $disk = $isImage ? 'public' : 'local';
            $file = $request->file($field);

            if ($file instanceof UploadedFile) {
                $path = $file->store("courses/{$course->id}/contents", $disk);
                if ($path === false) {
                    throw ValidationException::withMessages([$field => 'بارگذاری فایل انجام نشد. دوباره تلاش کنید.']);
                }
                $storedFiles[] = ['disk' => $disk, 'path' => $path];
                if ($record->exists && $record->path) {
                    $obsoleteFiles[] = ['disk' => $disk, 'path' => $record->path];
                }
                $record->path = $path;
                $record->name = $file->getClientOriginalName();
            } elseif (! $record->exists) {
                throw ValidationException::withMessages([$field => 'فایل محتوا الزامی است.']);
            }

            if ($request->filled('name')) {
                $record->name = $request->validated('name');
            }
        }

        $record->save();
    }

    private function assertRemindTarget(int $targetId, Course $course, ?Content $content): void
    {
        $visited = [];
        $currentId = $targetId;

        while ($currentId !== null) {
            if ($currentId === $content?->id || in_array($currentId, $visited, true)) {
                throw ValidationException::withMessages(['content_id' => 'یادآوری نمی‌تواند به خودش یا به چرخه‌ای از یادآوری‌ها اشاره کند.']);
            }
            $visited[] = $currentId;
            $target = Content::query()->with('lesson.section')->find($currentId);
            if ($target?->lesson?->section?->course_id !== $course->id) {
                throw ValidationException::withMessages(['content_id' => 'محتوای مرجع باید متعلق به همین دوره باشد.']);
            }
            $currentId = $target?->contentable_type === RemindContent::class
                ? RemindContent::query()->whereKey($target->contentable_id)->value('content_id')
                : null;
        }
    }

    private function syncAccesses(SaveEditorContentRequest $request, Course $course, Content $content): void
    {
        if (! $request->exists('accesses') && ! $request->boolean('update_accesses')) {
            return;
        }

        Gate::authorize('manageEditorCommerce', $course);
        $accesses = $request->validated('accesses', []);
        $removedIds = $content->accesses()->whereNotIn('plan_id', array_column($accesses, 'plan_id'))->pluck('id');
        DB::table('requirements')->whereIn('access_id', $removedIds)->delete();
        $content->accesses()->whereIn('id', $removedIds)->delete();

        foreach ($accesses as $item) {
            $access = $content->accesses()->firstOrCreate(['plan_id' => $item['plan_id']]);
            $requirements = $item['requirements'] ?? [];
            $access->requirements()->whereNotIn('space_id', array_column($requirements, 'space_id'))->delete();
            foreach ($requirements as $requirement) {
                DB::table('requirements')->updateOrInsert(
                    ['access_id' => $access->id, 'space_id' => $requirement['space_id']],
                    ['score' => $requirement['score']],
                );
            }
        }
    }

    private function typeRecord(Content $content): ?Model
    {
        return in_array($content->contentable_type, self::TYPE_CLASSES, true) ? $content->contentable : null;
    }

    /**
     * @return list<array{disk: string, path: string}>
     */
    private function recordFiles(Model $record): array
    {
        return match ($record::class) {
            ImageContent::class => [['disk' => 'public', 'path' => $record->path]],
            FileContent::class => [['disk' => 'local', 'path' => $record->path]],
            default => [],
        };
    }

    /**
     * @param  list<array{disk: string, path: string}>  $files
     */
    private function deleteStoredFiles(array $files): void
    {
        foreach ($files as $file) {
            Storage::disk($file['disk'])->delete($file['path']);
        }
    }
}
