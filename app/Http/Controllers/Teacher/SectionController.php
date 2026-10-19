<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreSectionRequest;
use App\Http\Requests\Teacher\UpdateSectionRequest;
use App\Models\Course;
use App\Models\Section;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class SectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course): Response
    {
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/course/section/index', [
            'course' => $course->load(['sections' => fn ($query) => $query->withCount(['lessons'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course): Response
    {
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/course/section/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSectionRequest $request, Course $course): RedirectResponse
    {
        abort_unless($course, 404);
        $item = DB::transaction(function () use ($request, $course): Section {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('updateEditorStructure', $course);
            $data = $request->validated();
            $data['order'] = (int) $course->sections()->max('order') + 1;
            if ($data['order'] > 32767) {
                throw ValidationException::withMessages(['order' => 'حداکثر ترتیب مجاز پر شده است.']);
            }

            return $course->sections()->create($data);
        });

        return to_route('teacher.course.editor', $course)->with('editor_created', ['kind' => 'section', 'id' => $item->id, 'parent_id' => $course->id]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Section $section): Response
    {
        $course = $section->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/section/show', [
            'section' => $section->load(['lessons'])->loadCount(['lessons']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Section $section): Response
    {
        $course = $section->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/section/edit', [
            'section' => $section,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSectionRequest $request, Section $section): RedirectResponse
    {
        $course = $section->course;
        abort_unless($course, 404);
        DB::transaction(function () use ($request, $section, $course): void {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('updateEditorStructure', $course);
            $section->update($request->validated());
        });

        return to_route('teacher.course.editor', $course);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section): RedirectResponse
    {
        $course = $section->course;
        abort_unless($course, 404);
        Gate::authorize('deleteEditorStructure', $course);
        DB::transaction(function () use ($section, $course): void {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('deleteEditorStructure', $course);
            $section->refresh();
            if ($section->lessons()->exists()) {
                throw ValidationException::withMessages(['delete' => 'ابتدا لسن‌های سکشن را حذف کنید.']);
            }
            $section->delete();
        });

        return to_route('teacher.course.editor', $course);
    }
}
