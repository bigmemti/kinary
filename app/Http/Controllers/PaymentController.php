<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Transaction;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function buy(Plan $plan){
        $client = new Client();

        $response = $client->post('https://sandbox.zarinpal.com/pg/v4/payment/request.json', [
            'json' => [
                'merchant_id' => '1344b5d4-0048-11e8-94db-005056a205be',
                'amount' => $plan->price,
                'description' => 'test',
                'callback_url' => 'http://127.0.0.1:8000/pay/callback',
            ]
        ]);

        $body = json_decode($response->getBody(), true);

        $transaction = Transaction::create([
            'user_id' => Auth::user()->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'gateway' => 'zarinpal',
            'authority' => $body['data']["authority"],
        ]);

        return redirect()->away('https://sandbox.zarinpal.com/pg/StartPay/' . $transaction->authority);
    }

    public function callback(){
        $authority = request('Authority');
        $transaction = Transaction::where('authority', $authority)->where('status', 'pending')->first();

        if(request('Status') == 'OK'){
            $client = new Client();
    
            $response = $client->post('https://sandbox.zarinpal.com/pg/v4/payment/verify.json', [
                'json' => [
                    'merchant_id' => '1344b5d4-0048-11e8-94db-005056a205be',
                    'amount' => $transaction->amount,
                    'authority' => $authority ,
                ]
            ]);
    
            $body = json_decode($response->getBody(), true);
            $code = $body['data']['code'];
        }else{
            $code = 403;
        }

        $transaction->update(($code == 100)? ['status' => 'paid', 'paid_at' => now()]: ['status' => 'failed']);

        $code == 100 && $transaction->user->plans()->attach($transaction->plan_id);

        return to_route(($code == 100)? 'studying': 'home');
    }
}
