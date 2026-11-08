<?php

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\FlashcardController;
use App\Http\Controllers\Student\HomeworkController;
use App\Http\Controllers\Student\QuizController;
use App\Http\Controllers\Student\StudyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::resource('enrollment', EnrollmentController::class)->only(['index', 'show']);
    Route::get('certificates', [CertificateController::class, 'index'])->name('certificate.index');
    Route::get('flashcards', [FlashcardController::class, 'index'])->name('flashcards.index');
    Route::get('flashcards/today', [FlashcardController::class, 'today'])->name('flashcards.today');
    Route::post('flashcards/decks', [FlashcardController::class, 'storeDeck'])->name('flashcards.decks.store');
    Route::delete('flashcards/decks/{deck}', [FlashcardController::class, 'destroyDeck'])->name('flashcards.decks.destroy');
    Route::post('flashcards/decks/{deck}/cards', [FlashcardController::class, 'storeCard'])->name('flashcards.cards.store');
    Route::delete('flashcards/cards/{card}', [FlashcardController::class, 'destroyCard'])->name('flashcards.cards.destroy');
    Route::post('flashcards/{card}/review', [FlashcardController::class, 'review'])->name('flashcards.review');
    Route::post('study/{space}/content/{content}/flashcards', [FlashcardController::class, 'import'])->name('flashcards.import');

    Route::get('study/{space}/lesson/{lesson}', [StudyController::class, 'show'])->name('study.lesson');
    Route::post('study/{space}/lesson/{lesson}/visit', [StudyController::class, 'visit'])->name('study.visit');
    Route::get('study/{space}/content/{content}/download', [StudyController::class, 'download'])->name('study.download');
    Route::get('study/{space}/content/{content}/reminder-download', [StudyController::class, 'reminderDownload'])->name('study.reminder-download');
    Route::post('study/{space}/content/{content}/homework', [HomeworkController::class, 'store'])->name('homework.store');
    Route::delete('study/{space}/content/{content}/homework', [HomeworkController::class, 'destroy'])->name('homework.destroy');
    Route::post('quiz/{space}/{quiz}/start', [QuizController::class, 'start'])->name('quiz.start');
    Route::get('quiz/attempt/{attempt}', [QuizController::class, 'show'])->name('quiz.show');
    Route::post('quiz/attempt/{attempt}/answer', [QuizController::class, 'answer'])->name('quiz.answer');
    Route::post('quiz/attempt/{attempt}/finish', [QuizController::class, 'finish'])->name('quiz.finish');
});
