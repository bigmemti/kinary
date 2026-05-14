<?php


use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->prefix('teacher')->name('teacher.')->group(function () {
    // Route::resource('course', CourseController::class);
    // Route::resource('course.plan', PlanController::class)->shallow();
    // Route::resource('course.section', SectionController::class)->shallow();
    
    // Route::resource('plan.enrollment', EnrollmentController::class)->only(['index'])->shallow();
    
    // Route::resource('section.lesson', LessonController::class)->shallow();
    
    // Route::resource('lesson.content', ContentController::class)->shallow();
});