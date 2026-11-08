<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreContentRequest;
use App\Http\Requests\Teacher\UpdateContentRequest;
use App\Models\Content;
use App\Models\Lesson;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Lesson $lesson)
    {
        Gate::authorize('viewEditor', $lesson->section->course);

        return inertia('teacher/lesson/content/index', [
            'lesson' => $lesson->load(['contents']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Lesson $lesson)
    {
        Gate::authorize('updateEditorStructure', $lesson->section->course);

        return inertia('teacher/lesson/content/create', [
            'lesson' => $lesson,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContentRequest $request, Lesson $lesson)
    {
        Gate::authorize('updateEditorStructure', $lesson->section->course);
        $lesson->contents()->create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Content $content)
    {
        Gate::authorize('viewEditor', $content->lesson->section->course);

        return inertia('teacher/content/show', [
            'content' => $content,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Content $content)
    {
        Gate::authorize('updateEditorStructure', $content->lesson->section->course);

        return inertia('teacher/content/edit', [
            'content' => $content,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContentRequest $request, Content $content)
    {
        Gate::authorize('updateEditorStructure', $content->lesson->section->course);
        $content->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Content $content)
    {
        Gate::authorize('deleteEditorStructure', $content->lesson->section->course);
        if ($reason = $content->deletionBlockReason()) {
            throw ValidationException::withMessages(['content' => $reason]);
        }
        $content->delete();
    }
}
