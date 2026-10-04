<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCoursePlanRequest;
use App\Models\Course;

class CourseSpaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course)
    {
        return inertia('admin/course/space/index', [
            'course' => $course->load(['spaces' => fn ($query) => $query->withCount(['plans'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course)
    {
        return inertia('admin/course/space/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCoursePlanRequest $request, Course $course)
    {
        $course->spaces()->create($request->validated());
    }
}
