<?php

use App\Http\Controllers\Frontend\CourseController;
use App\Http\Controllers\Frontend\HomeController;
use Illuminate\Support\Facades\Route;

//frontend
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::resource('course', CourseController::class)->only(['show'])->scoped(['course' => 'slug']);

require __DIR__.'/admin.php';
require __DIR__.'/dashboard.php';
require __DIR__.'/student.php';
require __DIR__.'/teacher.php';
require __DIR__.'/settings.php';
