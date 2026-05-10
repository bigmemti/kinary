<?php

namespace Database\Seeders;

// use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            AdminSeeder::class,
            CourseSeeder::class,
            PlanSeeder::class,
            PlanUserSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
