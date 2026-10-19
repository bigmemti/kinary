<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\UpdateEditorLessonRequest;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class EditorLessonController extends Controller
{
    public function update(UpdateEditorLessonRequest $request, Lesson $lesson): RedirectResponse
    {
        $storedPaths = [];
        $obsoletePaths = [];

        try {
            DB::transaction(function () use ($request, $lesson, &$storedPaths, &$obsoletePaths): void {
                $course = Course::query()->lockForUpdate()->findOrFail($lesson->section->course_id);
                Gate::authorize('updateEditorStructure', $course);
                $lesson->refresh();
                $data = $request->safe()->only(['name', 'order']);
                $images = array_values(array_diff($lesson->images ?? [], $request->validated('remove_images', [])));
                $obsoletePaths = array_values(array_diff($lesson->images ?? [], $images));

                if ($request->boolean('remove_thumbnail') || $request->hasFile('thumbnail_file')) {
                    if ($lesson->thumbnail) {
                        $obsoletePaths[] = $lesson->thumbnail;
                    }
                    $data['thumbnail'] = null;
                }

                foreach (['thumbnail_file' => $request->file('thumbnail_file') ? [$request->file('thumbnail_file')] : [], 'image_files' => $request->file('image_files', [])] as $field => $files) {
                    foreach ($files as $file) {
                        $path = $file->store("courses/{$course->id}/lessons/{$lesson->id}", 'public');
                        if ($path === false) {
                            throw ValidationException::withMessages([$field => 'بارگذاری تصویر انجام نشد. دوباره تلاش کنید.']);
                        }
                        $storedPaths[] = $path;
                        if ($field === 'thumbnail_file') {
                            $data['thumbnail'] = $path;
                        } else {
                            $images[] = $path;
                        }
                    }
                }

                if (count($images) > 10) {
                    throw ValidationException::withMessages(['image_files' => 'هر لسن حداکثر ۱۰ تصویر گالری دارد.']);
                }

                $lesson->update([...$data, 'images' => $images]);

                if ($request->exists('pricings') || $request->boolean('update_pricings')) {
                    Gate::authorize('manageEditorCommerce', $course);
                    $pricings = $request->validated('pricings', []);
                    $lesson->pricings()->whereNotIn('plan_id', array_column($pricings, 'plan_id'))->delete();
                    foreach ($pricings as $pricing) {
                        $lesson->pricings()->updateOrCreate(['plan_id' => $pricing['plan_id']], ['price' => $pricing['price']]);
                    }
                }
            });
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($storedPaths);
            throw $exception;
        }

        Storage::disk('public')->delete($obsoletePaths);

        return to_route('teacher.course.editor', $lesson->section->course_id);
    }
}
