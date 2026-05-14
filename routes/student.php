<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Student\StudentController;


Route::middleware(['auth', 'verified'])->prefix('student')->name('student.')->group(function () {
    // Route::resource('enrollment', EnrollmentController::class)->only(['index', 'show']);
    // Route::resource('enrollment.section', SectionController::class)->only(['index', 'show'])->shallow();
    
    // Route::resource('section.lesson', LessonController::class)->only(['index', 'show'])->shallow();
    
    // Route::resource('lesson.content', ContentController::class)->only(['index', 'show'])->shallow();
    
    // Route::resource('wallet.order', OrderController::class)->only(['index', 'show'])->shallow();
    // Route::resource('order.transaction', TransactionController::class)->only(['index', 'show'])->shallow();

    Route::get('studying', [StudentController::class, 'course'])->name('studying');
});