<?php

use App\Http\Controllers\Teacher;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('course/{course}/editor', Teacher\CourseEditorController::class)->name('course.editor');
    Route::patch('course/{course}/editor/information', [Teacher\CourseEditorController::class, 'updateInformation'])->name('course.editor.information');
    Route::put('course/{course}/editor/teachers', [Teacher\CourseEditorController::class, 'updateTeachers'])->name('course.editor.teachers');
    Route::patch('lesson/{lesson}/editor', [Teacher\EditorLessonController::class, 'update'])->name('lesson.editor.update');
    Route::post('lesson/{lesson}/editor/contents', [Teacher\EditorContentController::class, 'store'])->name('lesson.editor.contents.store');
    Route::patch('content/{content}/editor', [Teacher\EditorContentController::class, 'update'])->name('content.editor.update');
    Route::delete('content/{content}/editor', [Teacher\EditorContentController::class, 'destroy'])->name('content.editor.destroy');
    Route::get('content/{content}/editor/download', [Teacher\EditorContentController::class, 'download'])->name('content.editor.download');
    Route::resource('course', Teacher\CourseController::class);
    Route::resource('course.space', Teacher\SpaceController::class)->shallow();
    Route::resource('course.section', Teacher\SectionController::class)->shallow();

    Route::resource('space.plan', Teacher\PlanController::class)->shallow();
    Route::resource('plan.enrollment', Teacher\EnrollmentController::class)->only(['index'])->shallow();

    Route::resource('section.lesson', Teacher\LessonController::class)->shallow();

    Route::resource('lesson.content', Teacher\ContentController::class)->shallow();
});
