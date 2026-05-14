<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Student\PaymentController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    //payment
    Route::get('buy/plan/{plan}', [PaymentController::class, 'buy'])->name('plan.buy');
    Route::get('pay/callback', [PaymentController::class, 'callback'])->name('callback');

    //dashboard
    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');
    
    // Route::resource('wallet.order', OrderController::class)->only(['index', 'show'])->shallow();
    // Route::resource('order.transaction', TransactionController::class)->only(['index', 'show'])->shallow();
});