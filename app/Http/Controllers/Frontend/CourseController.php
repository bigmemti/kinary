<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Course;

class CourseController extends Controller
{
    public function show(Course $course)
    {
        return view('course-show', [
            'course' => $course->load('plans'),
        ]);
    }
}
