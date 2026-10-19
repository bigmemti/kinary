<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreLessonRequest;
use App\Http\Requests\Teacher\UpdateLessonRequest;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Section $section): Response
    {
        $course = $section->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/section/lesson/index', [
            'section' => $section->load(['lessons' => fn ($query) => $query->withCount(['contents'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Section $section): Response
    {
        $course = $section->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/section/lesson/create', [
            'section' => $section,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLessonRequest $request, Section $section): RedirectResponse
    {
        $course = $section->course;
        abort_unless($course, 404);
        $item = DB::transaction(function () use ($request, $section, $course): Lesson {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('updateEditorStructure', $course);
            $data = $request->validated();
            $data['order'] = (int) $section->lessons()->max('order') + 1;
            if ($data['order'] > 32767) {
                throw ValidationException::withMessages(['order' => 'حداکثر ترتیب مجاز پر شده است.']);
            }

            return $section->lessons()->create($data);
        });

        return to_route('teacher.course.editor', $course)->with('editor_created', ['kind' => 'lesson', 'id' => $item->id, 'parent_id' => $section->id]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Lesson $lesson): Response
    {
        $course = $lesson->section?->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/lesson/show', [
            'lesson' => $lesson->load(['contents'])->loadCount(['contents']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lesson $lesson): Response
    {
        $course = $lesson->section?->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/lesson/edit', [
            'lesson' => $lesson,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLessonRequest $request, Lesson $lesson): RedirectResponse
    {
        $course = $lesson->section?->course;
        abort_unless($course, 404);
        DB::transaction(function () use ($request, $lesson, $course): void {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('updateEditorStructure', $course);
            $lesson->update($request->validated());
        });

        return to_route('teacher.course.editor', $course);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lesson $lesson): RedirectResponse
    {
        $course = $lesson->section?->course;
        abort_unless($course, 404);
        Gate::authorize('deleteEditorStructure', $course);
        DB::transaction(function () use ($lesson, $course): void {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('deleteEditorStructure', $course);
            $lesson->refresh();
            if ($lesson->contents()->exists()) {
                throw ValidationException::withMessages(['delete' => 'ابتدا محتواهای لسن را حذف کنید.']);
            }
            $lesson->pricings()->delete();
            $lesson->delete();
        });

        Storage::disk('public')->delete(array_filter([$lesson->thumbnail, ...($lesson->images ?? [])]));

        return to_route('teacher.course.editor', $course);
    }
}
