<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StorePlanRequest;
use App\Http\Requests\Teacher\UpdatePlanRequest;
use App\Models\Course;
use App\Models\Plan;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course)
    {
        return inertia('teacher/course/plan/index', [
            'course' => $course->load(['plans' => fn ($query) => $query->withCount(['students', 'orders'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course)
    {
        return inertia('teacher/course/plan/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlanRequest $request, Course $course)
    {
        $course->plans()->create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan)
    {
        return inertia('teacher/plan/show', [
            'plan' => $plan->loadCount(['students', 'orders'])->load(['students.user']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan $plan)
    {
        return inertia('teacher/plan/edit', [
            'plan' => $plan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlanRequest $request, Plan $plan)
    {
        $plan->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan $plan)
    {
        $plan->delete();
    }
}
