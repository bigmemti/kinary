<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Course;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Course::all()->each(fn($course) => Plan::factory(fake()->numberBetween(1, 3))->for($course)->create());
    }
}
