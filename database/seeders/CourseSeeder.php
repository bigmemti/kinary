<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Teacher::inRandomOrder()
            ->take(rand(2, 4))
            ->get()
            ->each(
                fn ($teacher) => Course::factory(rand(1, 4))->for($teacher)->create()
            );
    }
}
