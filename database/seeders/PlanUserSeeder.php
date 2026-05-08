<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;

class PlanUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        (User::factory(10)->create())->each(fn($user) => $user->plans()->sync(Plan::inRandomOrder()->take(rand(2,5))->pluck('id')));
    }
}
