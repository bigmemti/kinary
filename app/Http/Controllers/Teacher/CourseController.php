<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\TeacherRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreCourseRequest;
use App\Http\Requests\Teacher\UpdateCourseRequest;
use App\Models\Course;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Response;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('teacher/course/index', [
            'courses' => auth()->user()->teacher->courses()->where('course_teacher.role', '!=', TeacherRole::Reminder->value)->withCount(['spaces', 'sections'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('teacher/course/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $course = Course::create(['is_published' => false, ...$request->validated()]);
            $course->teachers()->attach($request->user()->teacher->id, ['role' => TeacherRole::Owner]);
            app(ActivityLogger::class)->record('course.teacher.added', properties: ['teacher_id' => $request->user()->teacher->id, 'role' => TeacherRole::Owner->value], subject: $course);
        });

        return to_route('teacher.course.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/course/show', [
            'course' => $course->loadCount(['spaces', 'sections'])->load(['spaces', 'sections']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course): Response
    {
        Gate::authorize('updateEditorInformation', $course);

        return inertia('teacher/course/edit', [
            'course' => $course,
            'canPublish' => Gate::allows('publishEditorCourse', $course),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        DB::transaction(function () use ($request, $course): void {
            $lockedCourse = Course::query()->lockForUpdate()->findOrFail($course->id);
            Gate::authorize('updateEditorInformation', $lockedCourse);

            if ($request->exists('is_published')) {
                Gate::authorize('publishEditorCourse', $lockedCourse);
            }

            $lockedCourse->update($request->validated());
        });

        return to_route('teacher.course.edit', $course);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        Gate::authorize('manageEditorTeachers', $course);
        $course->delete();
    }
}
