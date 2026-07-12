<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLessonContentRequest;
use App\Models\Lesson;

class LessonContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Lesson $lesson)
    {
        return inertia('admin/lesson/content/index', [
            'lesson' => $lesson->load(['contents']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Lesson $lesson)
    {
        return inertia('admin/lesson/content/create', [
            'lesson' => $lesson,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLessonContentRequest $request, Lesson $lesson)
    {
        $lesson->contents()->create($request->validated());
    }
}
