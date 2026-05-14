<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\CourseController;


Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    
    // Route::resource('user', UserController::class);

    // Route::resource('student', StudentController::class);
    // Route::resource('student.enrollment', StudentEnrollmentController::class)->only(['index', 'create', 'store'])->shallow();

    // Route::resource('wallet', WalletController::class);
    // Route::resource('wallet.order', WalletOrderController::class)->only(['index', 'create', 'store'])->shallow();

    // Route::resource('teacher', TeacherController::class);
    // Route::resource('teacher.course', TeacherCourseController::class)->only(['index', 'create', 'store'])->shallow();

    Route::resource('course', CourseController::class);
    Route::resource('course.plan', PlanController::class)->only(['index', 'create', 'store'])->shallow();
    // Route::resource('course.section', CourseSectionController::class)->only(['index', 'create', 'store'])->shallow();
    
    // Route::resource('plan', PlanController::class);
    // Route::resource('plan.order', PlanOrderController::class)->only(['index'])->shallow();
    // Route::resource('plan.enrollment', PlanEnrollmentController::class)->only(['index'])->shallow();
    
    // Route::resource('section', SectionController::class);
    // Route::resource('section.lesson', SectionLessonController::class)->only(['index', 'create', 'store'])->shallow();
    
    // Route::resource('lesson', LessonController::class);
    // Route::resource('lesson.content', LessonContentController::class)->only(['index', 'create', 'store'])->shallow();
    
    // Route::resource('content', ContentController::class);
    
    // Route::resource('enrollment', EnrollmentController::class);
    
    // Route::resource('order', OrderController::class);
    // Route::resource('order.plan', OrderPlanController::class)->only(['index'])->shallow();
    // Route::resource('order.transaction', OrderTransactionController::class)->only(['index', 'create', 'store'])->shallow();

    // Route::resource('transaction', TransactionController::class);
});