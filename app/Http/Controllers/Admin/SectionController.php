<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSectionRequest;
use App\Http\Requests\Admin\UpdateSectionRequest;
use App\Models\Course;
use App\Models\Section;

class SectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/section/index', [
            'sections' => Section::with(['course.teacher.user'])->withCount(['lessons'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/section/create', [
            'courses' => Course::with('teacher.user')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSectionRequest $request)
    {
        Section::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Section $section)
    {
        return inertia('admin/section/show', [
            'section' => $section->load(['course.teacher.user', 'lessons' => fn ($query) => $query->take(5)->withCount(['contents'])])->loadCount(['lessons']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Section $section)
    {
        return inertia('admin/section/edit', [
            'course' => Course::with('teacher.user')->get(),
            'section' => $section->load(['course.teacher.user']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSectionRequest $request, Section $section)
    {
        $section->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section)
    {
        $section->delete();
    }
}
