<?php

namespace App\Services;

use GuzzleHttp\Client;

class PaymentService {
    public function __construct(
        private Client $client
    ) {}
    
    public function request(array $body){
        $response = $this->client->post('https://sandbox.zarinpal.com/pg/v4/payment/request.json', [
            'json' => [
                'merchant_id' => '1344b4d5-0048-11e8-94db-005056a205be',
                ...$body,
                'callback_url' => 'http://127.0.0.1:8000/pay/callback',
            ]
        ]);

        return json_decode($response->getBody(), true)['data']["authority"];
    }

    public function getPage(string $authority){
        return 'https://sandbox.zarinpal.com/pg/StartPay/' . $authority;
    }

    public function verify($amount, $authority){
        if(request('Status') == 'OK'){
            $client = new Client();
    
            $response = $client->post('https://sandbox.zarinpal.com/pg/v4/payment/verify.json', [
                'json' => [
                    'merchant_id' => '1344b4d5-0048-11e8-94db-005056a205be',
                    'amount' => $amount,
                    'authority' => $authority,
                ]
            ]);
    
            $body = json_decode($response->getBody(), true);
            $code = $body['data']['code'];
        }else{
            $code = 403;
        }

        return $code == 100;;
    }
    
}