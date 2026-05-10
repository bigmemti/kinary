<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //failed
        Plan::inRandomOrder()
            ->take(rand(5, 10))
            ->get()
            ->each(
                fn($plan) => User::inRandomOrder()
                                ->take(rand(2, 5))
                                ->get()
                                ->each(
                                    fn($user) => Transaction::factory(state:[
                                            'user_id' => $user->id, 
                                            'plan_id' => $plan->id, 
                                            'amount' => $plan->price, 
                                            'status' => 'failed',
                                        ])->create()
                                )
            );
        
        //paid
        Plan::has('users')
            ->with('users')
            ->get()
            ->each(
                fn($plan) => $plan
                                ->users
                                ->each(
                                    fn($user) => Transaction::factory(state:[
                                            'user_id' => $user->id, 
                                            'plan_id' => $plan->id, 
                                            'amount' => $plan->price, 
                                            'status' => 'paid',
                                        ])->create()
                                )
            );
        
        //pending
        Plan::doesntHave('users')
            ->inRandomOrder()
            ->take(rand(5, 10))
            ->get()
            ->each(
                fn($plan) => User::inRandomOrder()
                                ->take(rand(2, 5))
                                ->get()
                                ->each(
                                    fn($user) => Transaction::factory(state:[
                                            'user_id' => $user->id, 
                                            'plan_id' => $plan->id, 
                                            'amount' => $plan->price, 
                                            'status' => 'pending',
                                        ])->create()
                                )
            );
    }
}
