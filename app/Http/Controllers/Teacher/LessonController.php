<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreLessonRequest;
use App\Http\Requests\Teacher\UpdateLessonRequest;
use App\Models\Lesson;
use App\Models\Section;

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Section $section)
    {
        return inertia('teacher/section/lesson/index', [
            'section' => $section->load(['lessons' => fn ($query) => $query->withCount(['contents'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Section $section)
    {
        return inertia('teacher/section/lesson/create', [
            'section' => $section,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLessonRequest $request, Section $section)
    {
        $section->lessons()->create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Lesson $lesson)
    {
        return inertia('teacher/lesson/show', [
            'lesson' => $lesson->load(['contents'])->loadCount(['contents']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lesson $lesson)
    {
        return inertia('teacher/lesson/edit', [
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
