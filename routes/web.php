<?php

use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::view('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('course', CourseController::class);
});

require __DIR__.'/settings.php';
