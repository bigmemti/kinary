<?php

use App\Http\Controllers\FrontEnd\CourseController;
use App\Http\Controllers\FrontEnd\HomeController;
use Illuminate\Support\Facades\Route;

//frontend
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::resource('course', CourseController::class)->only(['show'])->scoped(['course' => 'slug']);

require __DIR__.'/admin.php';
require __DIR__.'/dashboard.php';
require __DIR__.'/student.php';
require __DIR__.'/teacher.php';
require __DIR__.'/settings.php';
