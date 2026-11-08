<?php

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\Frontend\CategoryController;
use App\Http\Controllers\Frontend\CourseController;
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\TeacherController;
use Illuminate\Support\Facades\Route;

// frontend
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::resource('course', CourseController::class)->only(['index', 'show'])->scoped(['course' => 'slug']);
Route::resource('category', CategoryController::class)->only(['show'])->scoped(['category' => 'slug']);
Route::get('/teachers/{teacher}', [TeacherController::class, 'show'])->name('teacher.show');
Route::get('/certificate/{token}', [CertificateController::class, 'show'])->name('certificate.show');
Route::get('/discussions', [CommunityController::class, 'index'])->name('community.index');
Route::get('/discussions/{discussion}/{slug?}', [CommunityController::class, 'show'])->name('community.show');
Route::middleware(['auth'])->group(function (): void {
    Route::post('/comments', [CommunityController::class, 'storeComment'])->middleware('throttle:20,1')->name('community.comments.store');
    Route::patch('/comments/{comment}/moderate', [CommunityController::class, 'moderate'])->name('community.comments.moderate');
    Route::get('/comment-moderation', [CommunityController::class, 'moderation'])->name('community.moderation');
    Route::post('/discussions', [CommunityController::class, 'storeDiscussion'])->middleware('throttle:10,1')->name('community.store');
});

require __DIR__.'/admin.php';
require __DIR__.'/dashboard.php';
require __DIR__.'/student.php';
require __DIR__.'/teacher.php';
require __DIR__.'/settings.php';

Route::get('/sitemap.xml', [HomeController::class, 'sitemap']);
