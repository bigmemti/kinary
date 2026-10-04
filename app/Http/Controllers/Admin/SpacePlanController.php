<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSpacePlanRequest;
use App\Models\Space;

class SpacePlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Space $space)
    {
        return inertia('admin/space/plan/index', [
            'space' => $space->load(['plans' => fn ($query) => $query->withCount(['plans'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Space $space)
    {
        return inertia('admin/space/plan/create', [
            'space' => $space,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSpacePlanRequest $request, Space $space)
    {
        $space->plans()->create($request->validated());
    }
}
