<?php

use App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('user', Admin\UserController::class);

    Route::resource('student', Admin\StudentController::class);
    Route::resource('student.enrollment', Admin\StudentEnrollmentController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('wallet', Admin\WalletController::class);
    Route::resource('wallet.order', Admin\WalletOrderController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('teacher', Admin\TeacherController::class);
    Route::resource('teacher.course', Admin\TeacherCourseController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('course', Admin\CourseController::class);
    Route::resource('course.plan', Admin\CoursePlanController::class)->only(['index', 'create', 'store'])->shallow();
    Route::resource('course.section', Admin\CourseSectionController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('plan', Admin\PlanController::class);
    Route::resource('plan.order', Admin\PlanOrderController::class)->only(['index'])->shallow();
    Route::resource('plan.enrollment', Admin\PlanEnrollmentController::class)->only(['index'])->shallow();

    Route::resource('section', Admin\SectionController::class);
    Route::resource('section.lesson', Admin\SectionLessonController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('lesson', Admin\LessonController::class);
    Route::resource('lesson.content', Admin\LessonContentController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('content', Admin\ContentController::class);

    Route::resource('enrollment', Admin\EnrollmentController::class);

    Route::resource('order', Admin\OrderController::class);
    Route::resource('order.plan', Admin\OrderPlanController::class)->only(['index'])->shallow();
    Route::resource('order.transaction', Admin\OrderTransactionController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('transaction', Admin\TransactionController::class);
});
