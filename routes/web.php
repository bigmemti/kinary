<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\FrontEnd\CourseController as FrontEndCourseController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('web/course/{course:slug}', [FrontEndCourseController::class, 'show'])->name('frontend.course.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('buy/plan/{plan}', [PaymentController::class, 'buy'])->name('plan.buy');
    Route::get('pay/callback', [PaymentController::class, 'callback'])->name('callback');
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('studying', [StudentController::class, 'course'])->name('studying');

    Route::resource('course', CourseController::class)->except(['crate']);
    Route::resource('course.plan', PlanController::class)->only(['store'])->shallow();
});

require __DIR__.'/settings.php';
