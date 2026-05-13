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
        (User::factory(10)->create())->each(fn($user) => $user->plans()->sync(Plan::pluckInRandomOrder(rand(2,5))));
    }
}
