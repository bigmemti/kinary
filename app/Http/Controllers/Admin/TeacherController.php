<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherRequest;
use App\Http\Requests\Admin\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Models\User;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/teacher/index', [
            'teachers' => Teacher::all()->load(['user'])->loadCount('courses'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/teacher/create', [
            'users' => User::doesntHave('teacher')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeacherRequest $request)
    {
        Teacher::create($request->validated());

        return to_route('admin.teacher.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Teacher $teacher)
    {
        return inertia('admin/teacher/show', [
            'teacher' => $teacher->load(['user', 'courses'])->loadCount('courses'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Teacher $teacher)
    {
        return inertia('admin/teacher/edit', [
            'teacher' => $teacher->load(['user']),
            'users' => [ ...User::doesntHave('teacher')->get(), $teacher->user],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        $teacher->update($request->validated());

        return to_route('admin.teacher.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        $teacher->delete();
        
        return to_route('admin.teacher.index');
    }
}
