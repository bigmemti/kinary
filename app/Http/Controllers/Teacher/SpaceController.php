<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreSpaceRequest;
use App\Http\Requests\Teacher\UpdateSpaceRequest;
use App\Models\Course;
use App\Models\Space;

class SpaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course)
    {
        return inertia('teacher/course/space/index', [
            'course' => $course->load(['spaces' => fn ($query) => $query->withCount(['students', 'orders'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course)
    {
        return inertia('teacher/course/space/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSpaceRequest $request, Course $course)
    {
        $course->spaces()->create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Space $space)
    {
        return inertia('teacher/space/show', [
            'space' => $space->loadCount(['students', 'orders'])->load(['students.user']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Space $space)
    {
        return inertia('teacher/space/edit', [
            'space' => $space,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSpaceRequest $request, Space $space)
    {
        $space->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Space $space)
    {
        $space->delete();
    }
}
