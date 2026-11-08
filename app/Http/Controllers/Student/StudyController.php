<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\FileContent;
use App\Models\Lesson;
use App\Models\RemindContent;
use App\Models\Space;
use App\Services\StudyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudyController extends Controller
{
    public function show(Request $request, Space $space, Lesson $lesson, StudyService $study): Response
    {
        return inertia('student/enrollment/show', $study->lessonData($request->user(), $space, $lesson));
    }

    public function visit(Request $request, Space $space, Lesson $lesson, StudyService $study): RedirectResponse
    {
        $study->visit($request->user(), $space, $lesson);

        return to_route('student.study.lesson', [$space, $lesson]);
    }

    public function download(Request $request, Space $space, Content $content, StudyService $study): StreamedResponse
    {
        $study->authorizeContent($request->user(), $space, $content);
        $file = $content->contentable_type === FileContent::class ? $content->contentable : null;
        abort_unless($file instanceof FileContent && Storage::disk('local')->exists($file->path), 404);
        $name = str_replace(['/', '\\', "\r", "\n"], '_', $file->name);

        return Storage::disk('local')->download($file->path, $name, ['X-Content-Type-Options' => 'nosniff']);
    }

    public function reminderDownload(Request $request, Space $space, Content $content, StudyService $study): StreamedResponse
    {
        $study->authorizeContent($request->user(), $space, $content);
        $reminder = $content->contentable_type === RemindContent::class ? $content->contentable : null;
        $target = $reminder?->target;
        $file = $target?->contentable_type === FileContent::class ? $target->contentable : null;
        abort_unless($file instanceof FileContent && Storage::disk('local')->exists($file->path), 404);
        $name = str_replace(['/', '\\', "\r", "\n"], '_', $file->name);

        return Storage::disk('local')->download($file->path, $name, ['X-Content-Type-Options' => 'nosniff']);
    }
}
