<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Content;
use App\Models\Space;
use App\Services\StudyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class HomeworkController extends Controller
{
    public function store(Request $request, Space $space, Content $content, StudyService $study): RedirectResponse
    {
        $study->authorizeContent($request->user(), $space, $content);
        abort_unless($content->contentable_type === Assignment::class, 404);
        $data = $request->validate(['files' => ['required', 'array', 'min:1', 'max:5'], 'files.*' => ['required', 'file', 'max:20480']]);
        $assignment = $content->contentable;
        $allowed = array_unique([...($assignment->allowed_extensions ?? []), 'zip']);
        foreach ($data['files'] as $file) {
            $extension = strtolower($file->getClientOriginalExtension());
            if (! in_array($extension, $allowed, true) || $file->getSize() > ($extension === 'zip' ? 20 : 5) * 1024 * 1024) {
                throw ValidationException::withMessages(['files' => 'نوع یا حجم یکی از فایل‌ها مجاز نیست.']);
            }
            if ($extension === 'zip' && ! in_array($file->getMimeType(), ['application/zip', 'application/x-zip-compressed', 'application/x-empty'], true)) {
                throw ValidationException::withMessages(['files' => 'فایل ZIP معتبر نیست.']);
            }
        }
        $paths = [];
        try {
            DB::transaction(function () use ($data, $assignment, $request, &$paths): void {
                Assignment::query()->whereKey($assignment->id)->lockForUpdate()->firstOrFail();
                if (DB::table('submissions')->where('assignment_id', $assignment->id)->where('student_id', $request->user()->student->id)->exists()) {
                    throw ValidationException::withMessages(['files' => 'ابتدا ارسال قبلی را حذف کنید.']);
                }
                $id = DB::table('submissions')->insertGetId(['assignment_id' => $assignment->id, 'student_id' => $request->user()->student->id, 'body' => '', 'created_at' => now(), 'updated_at' => now()]);
                foreach ($data['files'] as $file) {
                    $path = $file->store('homework', 'local');
                    if ($path === false) {
                        throw ValidationException::withMessages(['files' => 'بارگذاری فایل انجام نشد.']);
                    }
                    $paths[] = $path;
                    DB::table('submission_files')->insert(['submission_id' => $id, 'path' => $path, 'name' => $file->getClientOriginalName(), 'created_at' => now(), 'updated_at' => now()]);
                }
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($paths);
            throw $exception;
        }

        return back();
    }

    public function destroy(Request $request, Space $space, Content $content, StudyService $study): RedirectResponse
    {
        $study->authorizeContent($request->user(), $space, $content);
        abort_unless($content->contentable_type === Assignment::class, 404);
        $paths = DB::transaction(function () use ($content, $request): array {
            Assignment::query()->whereKey($content->contentable_id)->lockForUpdate()->firstOrFail();
            $submission = DB::table('submissions')->where('assignment_id', $content->contentable_id)->where('student_id', $request->user()->student->id)->lockForUpdate()->first();
            abort_unless($submission, 404);
            if ($submission->approved_at !== null) {
                throw ValidationException::withMessages(['files' => 'ارسال تأییدشده قابل حذف نیست.']);
            }
            $paths = DB::table('submission_files')->where('submission_id', $submission->id)->pluck('path')->all();
            DB::table('submission_files')->where('submission_id', $submission->id)->delete();
            DB::table('submissions')->where('id', $submission->id)->delete();

            return $paths;
        });
        Storage::disk('local')->delete($paths);

        return back();
    }
}
