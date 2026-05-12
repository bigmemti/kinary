<?php

namespace App\Http\Controllers\Student;

use App\Enums\TransactionStatus;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Transaction;
use App\Services\PaymentService;

class PaymentController extends Controller
{
    public function buy(Plan $plan, PaymentService $service){
        $authority = $service->request(['amount' => $plan->price, 'description' => 'test']);

        $plan->buy($authority);

        return redirect()->away($service->getPage($authority));
    }

    public function callback(PaymentService $service){
        $authority = request('Authority');
        $transaction = Transaction::where('authority', $authority)->where('status', 'pending')->first();
        if (!$transaction) 
            return to_route('home')->withErrors(['payment' => 'Invalid transaction']);
        

        $success = $service->verify($transaction->amount, $authority);

        $transaction->update($success? ['status' => TransactionStatus::Paid, 'paid_at' => now()]: ['status' => TransactionStatus::Failed]);
        if ($success)
            $transaction->user->plans()->syncWithoutDetaching([$transaction->plan_id]);

        return to_route($success? 'studying': 'home');
    }
}
