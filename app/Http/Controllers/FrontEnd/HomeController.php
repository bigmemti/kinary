<?php

namespace App\Http\Controllers\FrontEnd;

use App\Http\Controllers\Controller;
use App\Models\Course;

class HomeController extends Controller
{
    public function index(){
        return view('welcome', [
            'courses' => Course::where('status', 'published')->latest()->get(),
        ]);
    }
}
