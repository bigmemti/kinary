<?php

use App\Http\Controllers\FrontEnd\CourseController as FrontEndCourseController;
use App\Http\Controllers\FrontEnd\HomeController;
use App\Http\Controllers\Student\PaymentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//frontend
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('course/{course:slug}', [FrontEndCourseController::class, 'show'])->name('frontend.course.show');

Route::middleware(['auth', 'verified'])->group(function () {
    //payment
    Route::get('buy/plan/{plan}', [PaymentController::class, 'buy'])->name('plan.buy');
    Route::get('pay/callback', [PaymentController::class, 'callback'])->name('callback');

    //dashboard
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
});

require __DIR__.'/admin.php';
require __DIR__.'/student.php';
require __DIR__.'/teacher.php';
require __DIR__.'/settings.php';
