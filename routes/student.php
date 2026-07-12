<?php

use App\Http\Controllers\Student\EnrollmentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('student')->name('student.')->group(function () {
    Route::resource('enrollment', EnrollmentController::class)->only(['index', 'show']);

    // Route::resource('enrollment.lesson', SectionController::class)->only(['index', 'show'])->shallow();
});
