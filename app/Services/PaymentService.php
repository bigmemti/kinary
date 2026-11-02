<?php

namespace App\Services;

use GuzzleHttp\Client;
use UnexpectedValueException;

class PaymentService
{
    public function __construct(
        private Client $client
    ) {}

    /** @param array{amount: int, description: string} $body */
    public function request(array $body): string
    {
        $response = $this->client->post('https://payment.zarinpal.com/pg/v4/payment/request.json', [
            'json' => [
                'merchant_id' => env('MERCHANT_ID'),
                ...$body,
                'amount' => $body['amount'] * 10,
                'currency' => 'IRR',
                'callback_url' => route('callback'),
            ],
            'connect_timeout' => 5,
            'timeout' => 20,
        ]);

        $data = json_decode($response->getBody(), true)['data'] ?? [];
        if (($data['code'] ?? null) !== 100 || empty($data['authority'])) {
            throw new UnexpectedValueException('Payment request did not return an authority.');
        }

        return $data['authority'];
    }

    public function getPage(string $authority): string
    {
        return 'https://payment.zarinpal.com/pg/StartPay/'.$authority;
    }

    public function verify(int $amount, string $authority): bool
    {
        $response = $this->client->post('https://payment.zarinpal.com/pg/v4/payment/verify.json', [
            'json' => [
                'merchant_id' => env('MERCHANT_ID'),
                'amount' => $amount * 10,
                'authority' => $authority,
            ],
            'connect_timeout' => 5,
            'timeout' => 20,
        ]);

        $body = json_decode($response->getBody(), true);

        return in_array($body['data']['code'] ?? null, [100, 101], true);
    }
}
