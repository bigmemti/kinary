<?php

use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\StudyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::resource('enrollment', EnrollmentController::class)->only(['index', 'show']);

    Route::get('study/{space}/lesson/{lesson}', [StudyController::class, 'show'])->name('study.lesson');
    Route::post('study/{space}/lesson/{lesson}/visit', [StudyController::class, 'visit'])->name('study.visit');
    Route::get('study/{space}/content/{content}/download', [StudyController::class, 'download'])->name('study.download');
});
