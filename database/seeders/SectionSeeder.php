<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Course::getInRandomOrder(rand(4, 6))->each(fn ($course) => Section::factory(rand(2, 5))->for($course)->create());
    }
}
