<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\Course;
use App\Models\FileContent;
use App\Models\ImageContent;
use App\Models\Lesson;
use App\Models\TableContent;
use App\Models\TextContent;
use App\Models\VideoContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReminderSourceController extends Controller
{
    public const TYPES = [TextContent::class, ImageContent::class, VideoContent::class, FileContent::class, TableContent::class];

    public function __invoke(Request $request, Course $course): JsonResponse
    {
        Gate::authorize('updateEditorStructure', $course);
        $data = $request->validate(['source' => ['nullable', 'integer'], 'lesson' => ['nullable', 'integer'], 'content' => ['nullable', 'integer']]);
        $sources = Course::query()->whereHas('teachers', fn ($query) => $query->where('teachers.user_id', $request->user()->id));

        if (empty($data['source'])) {
            return response()->json($sources->orderBy('title')->get(['id', 'title']));
        }

        $source = $sources->findOrFail($data['source']);
        if (empty($data['lesson'])) {
            return response()->json(Lesson::query()->whereHas('section', fn ($query) => $query->where('course_id', $source->id))
                ->with('section:id,name')->orderBy('order')->orderBy('id')->get(['id', 'section_id', 'name'])
                ->map(fn (Lesson $lesson): array => ['id' => $lesson->id, 'name' => $lesson->section->name.' / '.$lesson->name]));
        }

        $lesson = Lesson::query()->whereHas('section', fn ($query) => $query->where('course_id', $source->id))->findOrFail($data['lesson']);

        if (! empty($data['content'])) {
            $target = $lesson->contents()->whereIn('contentable_type', self::TYPES)->findOrFail($data['content']);
            $record = $target->contentable;

            return response()->json([
                'type' => match ($target->contentable_type) {
                    TextContent::class => 'text', ImageContent::class => 'image', VideoContent::class => 'video', TableContent::class => 'table', default => 'file',
                },
                'body' => $record instanceof TextContent ? $record->body : null,
                'rows' => $record instanceof TableContent ? $record->table : null,
                'name' => $record->name ?? null,
                'url' => match (true) {
                    $record instanceof ImageContent => Storage::disk('public')->url($record->path),
                    $record instanceof VideoContent => $record->path,
                    $record instanceof FileContent => route('teacher.course.editor.reminder-download', [$course, $target]),
                    default => null,
                },
            ]);
        }

        return response()->json($lesson->contents()->whereIn('contentable_type', self::TYPES)->orderBy('order')->orderBy('id')
            ->get(['id', 'description', 'contentable_type', 'contentable_id'])->load('contentable')
            ->map(fn (Content $content): array => ['id' => $content->id, 'name' => $content->description ?: ($content->contentable->name ?? 'محتوا '.$content->id)]));
    }

    public function download(Request $request, Course $course, Content $content): StreamedResponse
    {
        Gate::authorize('updateEditorStructure', $course);
        abort_unless($content->lesson?->section?->course?->teachers()->where('teachers.user_id', $request->user()->id)->exists(), 404);
        $file = $content->contentable_type === FileContent::class ? $content->contentable : null;
        abort_unless($file instanceof FileContent && Storage::disk('local')->exists($file->path), 404);
        $name = str_replace(['/', '\\', "\r", "\n"], '_', $file->name);

        return Storage::disk('local')->download($file->path, $name, ['X-Content-Type-Options' => 'nosniff']);
    }
}
