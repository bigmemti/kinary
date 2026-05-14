<?php

use App\Http\Controllers\FrontEnd\CourseController as FrontEndCourseController;
use App\Http\Controllers\FrontEnd\HomeController;
use Illuminate\Support\Facades\Route;

//frontend
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('course/{course:slug}', [FrontEndCourseController::class, 'show'])->name('frontend.course.show');


require __DIR__.'/admin.php';
require __DIR__.'/dashboard.php';
require __DIR__.'/student.php';
require __DIR__.'/teacher.php';
require __DIR__.'/settings.php';
