<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentEnrollmentRequest;
use App\Models\Plan;
use App\Models\Student;

class StudentEnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Student $student)
    {
        return inertia('admin/student/enrollment/index', [
            'student' => $student->load(['enrollments.plan.course.teacher.user', 'user']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Student $student)
    {
        return inertia('admin/student/enrollment/create', [
            'student' => $student->load(['user']),
            'plans' => Plan::whereDoesntHave('students', function ($query) use ($student) {
                $query->where('students.id', $student->id);
            })->with(['course.teacher.user'])->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStudentEnrollmentRequest $request, Student $student)
    {
        $student->enrollments()->create($request->validated());

        return to_route('admin.student.enrollment.index', ['student' => $student]);
    }
}
