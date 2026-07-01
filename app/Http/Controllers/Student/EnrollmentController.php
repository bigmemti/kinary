<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('student/enrollment/index', [
            'enrollments' => auth()->user()->student->enrollments->load(['plan.course' => fn ($query) => $query->with(['teacher.user.student', 'sections.lessons'])]),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Enrollment $enrollment)
    {
        //
    }
}
