<?php

namespace App\Http\Controllers\FrontEnd;

use App\Http\Controllers\Controller;
use App\Models\Course;

class CourseController extends Controller
{
    public function show(Course $course){
        return view('course-show',[
            'course' => $course->load('plans'),
        ]);
    }
}
