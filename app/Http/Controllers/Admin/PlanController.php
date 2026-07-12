<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePlanRequest;
use App\Http\Requests\Admin\UpdatePlanRequest;
use App\Models\Course;
use App\Models\Plan;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/plan/index', [
            'plans' => Plan::with(['course.teacher.user'])->withCount(['orders', 'students'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/plan/create', [
            'courses' => Course::with(['teacher.user'])->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlanRequest $request)
    {
        Plan::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan)
    {
        return inertia('admin/plan/show', [
            'plan' => $plan->load([
                'course.teacher.user',
                'orders' => fn ($query) => $query->take(5)->with(['wallet.user'])->withCount(['transactions'])->withSum('plans as amount', 'price'),
                'students' => fn ($query) => $query->take(5)->with(['user']),
            ])->loadCount(['orders', 'students']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan $plan)
    {
        return inertia('admin/plan/edit', [
            'courses' => Course::with(['teacher.user'])->get(),
            'plan' => $plan->load(['course.teacher.user']),
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
