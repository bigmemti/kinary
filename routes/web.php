<?php

use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\FrontEnd\CourseController as FrontEndCourseController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//web
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('course/{course:slug}', [FrontEndCourseController::class, 'show'])->name('frontend.course.show');

Route::middleware(['auth', 'verified'])->group(function () {
    //payment
    Route::get('buy/plan/{plan}', [PaymentController::class, 'buy'])->name('plan.buy');
    Route::get('pay/callback', [PaymentController::class, 'callback'])->name('callback');
    //dashboard
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    //student
    Route::get('studying', [StudentController::class, 'course'])->name('studying');

    //teacher

    //admin
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('course', CourseController::class)->except(['crate']);
        Route::resource('course.plan', PlanController::class)->only(['store'])->shallow();
    });
});

require __DIR__.'/settings.php';
