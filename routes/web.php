<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\PlanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::view('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('course', CourseController::class)->except(['crate']);
    Route::resource('course', PlanController::class)->only(['store']);
});

require __DIR__.'/settings.php';
