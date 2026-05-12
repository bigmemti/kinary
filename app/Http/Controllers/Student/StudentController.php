<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class StudentController extends Controller
{
    public function course(){
        return Inertia::render('study',[
            'courses' => Course::whereRelation('plans.users', 'id', Auth::user()->id)->get(),
        ]);
    } 
}
