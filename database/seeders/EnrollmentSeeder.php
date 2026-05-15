<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory(10)
            ->create()
            ->load(['student', 'wallet'])
            ->each(
                function($user) {
                    $plans = Plan::getInRandomOrder(rand(2,5));
                    
                    $user->student->plans()->syncWithPivotValues($plans->pluck('id'));

                    $order = $user->wallet->orders()->create(['status' => 'paid']);

                    $order->plans()->syncWithPivotValues($plans->pluck('id'));
                }
            );
    }
}
