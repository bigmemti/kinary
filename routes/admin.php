<?php

use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CoursePlanController;
use App\Http\Controllers\Admin\CourseSectionController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\LessonContentController;
use App\Http\Controllers\Admin\LessonController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\OrderPlanController;
use App\Http\Controllers\Admin\OrderTransactionController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\PlanEnrollmentController;
use App\Http\Controllers\Admin\PlanOrderController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\SectionLessonController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\StudentEnrollmentController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\TeacherCourseController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WalletController;
use App\Http\Controllers\Admin\WalletOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('user', UserController::class);

    Route::resource('student', StudentController::class);
    Route::resource('student.enrollment', StudentEnrollmentController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('wallet', WalletController::class);
    Route::resource('wallet.order', WalletOrderController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('teacher', TeacherController::class);
    Route::resource('teacher.course', TeacherCourseController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('course', CourseController::class);
    Route::resource('course.plan', CoursePlanController::class)->only(['index', 'create', 'store'])->shallow();
    Route::resource('course.section', CourseSectionController::class)->only(['index', 'create', 'store'])->shallow();
    
    Route::resource('plan', PlanController::class);
    Route::resource('plan.order', PlanOrderController::class)->only(['index'])->shallow();
    Route::resource('plan.enrollment', PlanEnrollmentController::class)->only(['index'])->shallow();
    
    Route::resource('section', SectionController::class);
    Route::resource('section.lesson', SectionLessonController::class)->only(['index', 'create', 'store'])->shallow();
    
    Route::resource('lesson', LessonController::class);
    Route::resource('lesson.content', LessonContentController::class)->only(['index', 'create', 'store'])->shallow();
    
    Route::resource('content', ContentController::class);
    
    Route::resource('enrollment', EnrollmentController::class);
    
    Route::resource('order', OrderController::class);
    Route::resource('order.plan', OrderPlanController::class)->only(['index'])->shallow();
    Route::resource('order.transaction', OrderTransactionController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('transaction', TransactionController::class);
});