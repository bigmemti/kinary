<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLessonRequest;
use App\Http\Requests\Admin\UpdateLessonRequest;
use App\Models\Lesson;
use App\Models\Section;

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/lesson/index', [
            'lessons' => Lesson::withCount(['contents'])->with(['section.course.teacher.user'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/lesson/create', [
            'sections' => Section::with(['course.teacher.user'])->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLessonRequest $request)
    {
        Lesson::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Lesson $lesson)
    {
        return inertia('admin/lesson/show', [
            'lesson' => $lesson->load(['section.course.teacher.user', 'contents'])->loadCount(['contents']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lesson $lesson)
    {
        return inertia('admin/lesson/edit', [
            'sections' => Section::with(['course.teacher.user'])->get(),
            'lesson' => $lesson,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLessonRequest $request, Lesson $lesson)
    {
        $lesson->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lesson $lesson)
    {
        $lesson->delete();
    }
}
