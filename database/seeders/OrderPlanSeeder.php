<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class OrderPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Order::where('status', 'pending')
            ->get()
            ->each(
                function($order){
                    $plans = Plan::getInRandomOrder(rand(3, 5));

                    $order->plans()->syncWithPivotValues($plans->pluck('id'), ['updated_at' => now()]);
                }
            );
    }
}
