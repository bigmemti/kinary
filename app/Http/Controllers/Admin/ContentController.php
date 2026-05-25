<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContentRequest;
use App\Http\Requests\Admin\UpdateContentRequest;
use App\Models\Content;
use App\Models\Lesson;

class ContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/content/index', [
            'contents' => Content::with(['lesson.section.course.teacher.user'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/content/create', [
            'lessons' => Lesson::with(['section.course.teacher.user'])->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContentRequest $request)
    {
        Content::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Content $content)
    { 
        return inertia('admin/content/show', [
            'content' => $content->load(['lesson.section.course.teacher.user']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Content $content)
    {
        return inertia('admin/content/edit', [
            'lessons' => Lesson::with(['section.course.teacher.user'])->get(),
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
