<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCoursePlanRequest;
use App\Models\Course;

class CoursePlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course)
    {
        return inertia('admin/course/plan/index', [
            'course' => $course->load(['plans' => fn ($query) => $query->withCount(['orders', 'students'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course)
    {
        return inertia('admin/course/plan/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCoursePlanRequest $request, Course $course)
    {
        $course->plans()->create($request->validated());
    }
}
