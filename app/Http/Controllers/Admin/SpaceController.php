<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSpaceRequest;
use App\Http\Requests\Admin\UpdateSpaceRequest;
use App\Models\Course;
use App\Models\Space;

class SpaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/space/index', [
            'spaces' => Space::with(['course.teacher.user'])->withCount(['orders', 'students'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/space/create', [
            'courses' => Course::with(['teacher.user'])->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSpaceRequest $request)
    {
        Space::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(Space $space)
    {
        return inertia('admin/space/show', [
            'space' => $space->load([
                'course.teacher.user',
                'orders' => fn ($query) => $query->take(5)->with(['wallet.user'])->withCount(['transactions'])->withSum('spaces as amount', 'price'),
                'students' => fn ($query) => $query->take(5)->with(['user']),
            ])->loadCount(['orders', 'students']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Space $space)
    {
        return inertia('admin/space/edit', [
            'courses' => Course::with(['teacher.user'])->get(),
            'space' => $space->load(['course.teacher.user']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSpaceRequest $request, Space $space)
    {
        $space->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Space $space)
    {
        $space->delete();
    }
}
