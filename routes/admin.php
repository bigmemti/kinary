<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])
    ->namespace('App\Http\Controllers\Admin')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('user', 'UserController');

        Route::resource('student', 'StudentController');
        Route::resource('student.enrollment', 'StudentEnrollmentController')->only(['index', 'create', 'store'])->shallow();

        Route::resource('wallet', 'WalletController');
        Route::resource('wallet.order', 'WalletOrderController')->only(['index', 'create', 'store'])->shallow();

        Route::resource('teacher', 'TeacherController');
        Route::resource('teacher.course', 'TeacherCourseController')->only(['index', 'create', 'store'])->shallow();

        Route::resource('course', 'CourseController');
        Route::resource('course.plan', 'CoursePlanController')->only(['index', 'create', 'store'])->shallow();
        Route::resource('course.section', 'CourseSectionController')->only(['index', 'create', 'store'])->shallow();
        
        Route::resource('plan', 'PlanController');
        Route::resource('plan.order', 'PlanOrderController')->only(['index'])->shallow();
        Route::resource('plan.enrollment', 'PlanEnrollmentController')->only(['index'])->shallow();
        
        Route::resource('section', 'SectionController');
        Route::resource('section.lesson', 'SectionLessonController')->only(['index', 'create', 'store'])->shallow();
        
        Route::resource('lesson', 'LessonController');
        Route::resource('lesson.content', 'LessonContentController')->only(['index', 'create', 'store'])->shallow();
        
        Route::resource('content', 'ContentController');
        
        Route::resource('enrollment', 'EnrollmentController');
        
        Route::resource('order', 'OrderController');
        Route::resource('order.plan', 'OrderPlanController')->only(['index'])->shallow();
        Route::resource('order.transaction', 'OrderTransactionController')->only(['index', 'create', 'store'])->shallow();

        Route::resource('transaction', 'TransactionController');
});