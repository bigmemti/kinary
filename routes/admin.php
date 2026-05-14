<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\CourseController;


Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    
    // Route::resource('user', CourseController::class);

    // Route::resource('student', CourseController::class);
    // Route::resource('student.enrollment', PlanController::class)->only(['index', 'create', 'store'])->shallow();

    // Route::resource('wallet', CourseController::class);
    // Route::resource('wallet.order', PlanController::class)->only(['index', 'create', 'store'])->shallow();

    // Route::resource('teacher', CourseController::class);
    // Route::resource('teacher.course', PlanController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('course', CourseController::class);
    Route::resource('course.plan', PlanController::class)->only(['index', 'create', 'store'])->shallow();
    // Route::resource('course.section', PlanController::class)->only(['index', 'create', 'store'])->shallow();
    
    // Route::resource('plan', CourseController::class);
    // Route::resource('plan.order', PlanController::class)->only(['index', 'create', 'store'])->shallow();
    // Route::resource('plan.enrollment', PlanController::class)->only(['index', 'create', 'store'])->shallow();
    
    // Route::resource('section', CourseController::class);
    // Route::resource('section.lesson', PlanController::class)->only(['index', 'create', 'store'])->shallow();
    
    // Route::resource('lesson', CourseController::class);
    // Route::resource('lesson.content', PlanController::class)->only(['index', 'create', 'store'])->shallow();
    
    // Route::resource('content', CourseController::class);
    
    // Route::resource('enrollment', CourseController::class);
    
    // Route::resource('order', CourseController::class);
    // Route::resource('order.plan', PlanController::class)->only(['index', 'create', 'store'])->shallow();
    // Route::resource('order.transaction', PlanController::class)->only(['index', 'create', 'store'])->shallow();

    // Route::resource('transaction', CourseController::class);
});