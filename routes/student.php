<?php

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\HomeworkController;
use App\Http\Controllers\Student\QuizController;
use App\Http\Controllers\Student\StudyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::resource('enrollment', EnrollmentController::class)->only(['index', 'show']);
    Route::get('certificates', [CertificateController::class, 'index'])->name('certificate.index');

    Route::get('study/{space}/lesson/{lesson}', [StudyController::class, 'show'])->name('study.lesson');
    Route::post('study/{space}/lesson/{lesson}/visit', [StudyController::class, 'visit'])->name('study.visit');
    Route::get('study/{space}/content/{content}/download', [StudyController::class, 'download'])->name('study.download');
    Route::post('study/{space}/content/{content}/homework', [HomeworkController::class, 'store'])->name('homework.store');
    Route::delete('study/{space}/content/{content}/homework', [HomeworkController::class, 'destroy'])->name('homework.destroy');
    Route::post('quiz/{space}/{quiz}/start', [QuizController::class, 'start'])->name('quiz.start');
    Route::get('quiz/attempt/{attempt}', [QuizController::class, 'show'])->name('quiz.show');
    Route::post('quiz/attempt/{attempt}/answer', [QuizController::class, 'answer'])->name('quiz.answer');
    Route::post('quiz/attempt/{attempt}/finish', [QuizController::class, 'finish'])->name('quiz.finish');
});
