<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // failed
        Order::getInRandomOrder(rand(5, 10))
            ->each(
                fn ($order) => Transaction::factory(rand(1, 3), [
                    'amount' => $order->plans()->sum('price'),
                    'status' => 'failed',
                ])->for($order)->create()
            );

        // paid
        Order::where('status', 'paid')
            ->get()
            ->each(
                fn ($order) => Transaction::factory(state: [
                    'amount' => $order->plans()->sum('price'),
                    'status' => 'paid',
                ])->for($order)->create()

            );

        // pending
        Order::whereNot('status', 'paid')
            ->inRandomOrder()
            ->take(rand(5, 8))
            ->get()
            ->each(
                fn ($order) => Transaction::factory(state: [
                    'amount' => $order->plans()->sum('price'),
                ])->for($order)->create()
            );
    }
}
