<?php

use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Student\PaymentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    // payment
    Route::post('buy/plan/{plan}', [PaymentController::class, 'buy'])->name('plan.buy');
    Route::get('cart', [CartController::class, 'index'])->name('cart.index');
    Route::delete('cart/plan/{plan}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::post('checkout', [PaymentController::class, 'checkout'])->name('checkout');
    Route::get('pay/callback', [PaymentController::class, 'callback'])->name('callback');

    // dashboard
    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    // Route::resource('wallet.order', OrderController::class)->only(['index', 'show'])->shallow();
});
