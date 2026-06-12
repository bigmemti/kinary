<?php

use App\Http\Controllers\Teacher;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::resource('course', Teacher\CourseController::class);
    Route::resource('course.plan', Teacher\PlanController::class)->shallow();
    Route::resource('course.section', Teacher\SectionController::class)->shallow();
    
    Route::resource('plan.enrollment', Teacher\EnrollmentController::class)->only(['index'])->shallow();
    
    Route::resource('section.lesson', Teacher\LessonController::class)->shallow();
    
    Route::resource('lesson.content', Teacher\ContentController::class)->shallow();
});