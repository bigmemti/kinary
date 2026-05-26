<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEnrollmentRequest;
use App\Http\Requests\Admin\UpdateEnrollmentRequest;
use App\Models\Enrollment;
use App\Models\Plan;
use App\Models\Student;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/enrollment/index', [
            'enrollments' => Enrollment::with(['plan.course.teacher.user', 'student.user'])->latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/enrollment/create', [
            'plans' => Plan::with(['course.teacher.user'])->get(),
            'students' => Student::with(['user'])->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEnrollmentRequest $request)
    {
        Enrollment::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Enrollment $enrollment)
    {
        return inertia('admin/enrollment/show', [
            'enrollment' => $enrollment->load(['plan.course.teacher.user', 'student.user']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Enrollment $enrollment)
    {
        return inertia('admin/enrollment/edit', [
            'plans' => Plan::with(['course.teacher.user'])->get(),
            'students' => Student::with(['user'])->get(),
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment)
    {
        $enrollment->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Enrollment $enrollment)
    {
        $enrollment->delete();
    }
}
