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
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Teacher $teacher)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeacherCourseRequest $request, Teacher $teacher)
    {
        //
    }
}
