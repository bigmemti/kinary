<?php

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\Frontend\CategoryController;
use App\Http\Controllers\Frontend\CourseController;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\TeacherController;
use Illuminate\Support\Facades\Route;

// frontend
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::resource('course', CourseController::class)->only(['index', 'show'])->scoped(['course' => 'slug']);
Route::resource('category', CategoryController::class)->only(['show'])->scoped(['category' => 'slug']);
Route::get('/teachers/{teacher}', [TeacherController::class, 'show'])->name('teacher.show');
Route::get('/certificate/{token}', [CertificateController::class, 'show'])->name('certificate.show');

require __DIR__.'/admin.php';
require __DIR__.'/dashboard.php';
require __DIR__.'/student.php';
require __DIR__.'/teacher.php';
require __DIR__.'/settings.php';

Route::get('/sitemap.xml', [HomeController::class, 'sitemap']);
