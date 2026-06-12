<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Http\Requests\Teacher\StoreContentRequest;
use App\Http\Requests\Teacher\UpdateContentRequest;
use App\Models\Lesson;

class ContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Lesson $lesson)
    {
        return inertia('teacher/lesson/content/index', [
            'lesson' => $lesson->load(['contents']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Lesson $lesson)
    {
        return inertia('teacher/lesson/content/create', [
            'lesson' => $lesson,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContentRequest $request, Lesson $lesson)
    {
        $lesson->contents()->create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Content $content)
    {
        return inertia('teacher/content/show', [
            'content' => $content,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Content $content)
    {
        return inertia('teacher/content/edit', [
            'content' => $content,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContentRequest $request, Content $content)
    {
        $content->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Content $content)
    {
        $content->delete();
    }
}
