<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTeacherCourseRequest;
use App\Models\Teacher;

class TeacherCourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Teacher $teacher)
    {
        return inertia('admin/teacher/course/index', [
            'teacher' => $teacher->load(['courses' => fn ($query) => $query->withCount('plans'), 'user']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Teacher $teacher)
    {
        return inertia('admin/teacher/course/create', [
            'teacher' => $teacher->load(['user']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeacherCourseRequest $request, Teacher $teacher)
    {
        $teacher->courses()->create($request->validated());

        return to_route('admin.teacher.course.index', ['teacher' => $teacher]);
    }
}
