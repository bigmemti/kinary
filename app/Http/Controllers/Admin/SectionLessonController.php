<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSectionLessonRequest;
use App\Models\Section;

class SectionLessonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Section $section)
    {
        return inertia('admin/section/lesson/index', [
            'section' => $section->load(['lessons' => fn ($query) => $query->withCount('contents')]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Section $section)
    {
        return inertia('admin/section/lesson/create', [
            'section' => $section,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSectionLessonRequest $request, Section $section)
    {
        $section->lessons()->create($request->validated());
    }
}
