<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Models\Student;
use App\Models\User;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/student/index', [
            'students' => Student::all()->load(['user'])->loadCount('enrollments'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/student/create', [
            'users' => User::doesntHave('student')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStudentRequest $request)
    {
        Student::create($request->validated());

        return to_route('admin.student.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        return inertia('admin/student/show', [
            'student' => $student->load(['user', 'enrollments.plan.course.teacher.user'])->loadCount('enrollments'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Student $student)
    {
        return inertia('admin/student/edit', [
            'student' => $student->load(['user']),
            'users' => [...User::doesntHave('student')->get(), $student->user],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

        return to_route('admin.student.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        $student->delete();

        return to_route('admin.student.index');
    }
}
