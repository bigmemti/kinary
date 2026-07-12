<?php

namespace App\Http\Controllers\Student;

use App\Enums\TransactionStatus;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\PaymentService;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function buy(Plan $plan)
    {
        $order = (Auth::user()->hasActiveCart()) ? Auth::user()->activeCart() : Auth::user()->wallet->orders()->create();

        $order->plans()->syncWithoutDetaching([$plan->id]);

        return redirect()->back();
    }

    public function checkout(PaymentService $service)
    {
        $authority = $service->request(['amount' => Auth::user()->activeCart()->plans()->sum('price'), 'description' => 'test']);
        Auth::user()->activeCart()->transactions()->create(['authority' => $authority, 'amount' => Auth::user()->activeCart()->plans()->sum('price'), 'gateway' => 'zarinpal']);

        return redirect()->away($service->getPage($authority));
    }

    public function callback(PaymentService $service)
    {
        $authority = request('Authority');
        $transaction = Auth::user()->activeCart()->transactions()->where('authority', $authority)->where('status', 'pending')->first();
        if (! $transaction) {
            return to_route('home')->withErrors(['payment' => 'Invalid transaction']);
        }

        $success = $service->verify($transaction->amount, $authority);
        $plans = Auth::user()->activeCart()->plans;

        $transaction->update($success ? ['status' => TransactionStatus::Paid, 'paid_at' => now()] : ['status' => TransactionStatus::Failed]);
        Auth::user()->activeCart()->update($success ? ['status' => 'paid'] : ['status' => 'pending']);
        if ($success) {
            Auth::user()->student->plans()->syncWithoutDetaching($plans->pluck('id'));
        }

        return to_route($success ? 'dashboard' : 'home');
    }
}
