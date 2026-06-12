<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Http\Requests\Teacher\StoreCourseRequest;
use App\Http\Requests\Teacher\UpdateCourseRequest;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('teacher/course/index', [
            'courses' => auth()->user()->teacher->courses->loadCount(['plans', 'sections']),
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
    public function store(StoreCourseRequest $request)
    {
        auth()->user()->teacher->courses()->create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        return inertia('teacher/course/show', [
            'course' => $course->loadCount(['plans', 'sections'])->load(['plans', 'sections']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        return inertia('teacher/course/edit', [
            'course' => $course,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseRequest $request, Course $course)
    {
        $course->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        $course->delete();
    }
}
