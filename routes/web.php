<?php

use App\Enums\TeacherRole;
use App\Http\Controllers\Frontend\CategoryController;
use App\Http\Controllers\Frontend\CourseController;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\TeacherController;
use App\Models\Category;
use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Route;

// frontend
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::resource('course', CourseController::class)->only(['index', 'show'])->scoped(['course' => 'slug']);
Route::get('/categories/{category:slug}', [CategoryController::class, 'show'])->name('category.show');
Route::get('/teachers/{teacher}', [TeacherController::class, 'show'])->name('teacher.show');

require __DIR__.'/admin.php';
require __DIR__.'/dashboard.php';
require __DIR__.'/student.php';
require __DIR__.'/teacher.php';
require __DIR__.'/settings.php';

Route::get('/sitemap.xml', function () {
    $courses = Course::query()
        ->where('is_published', true)
        ->get();

    return response()
        ->view('sitemap', ['courses' => $courses, 'categories' => Category::query()->get(['id', 'slug']), 'teachers' => Teacher::query()->whereHas('courses', fn (Builder $query): Builder => $query->where('is_published', true)->whereIn('course_teacher.role', [TeacherRole::Owner, TeacherRole::Instructor]))->get(['id'])])
        ->header('Content-Type', 'application/xml; charset=UTF-8');
});
