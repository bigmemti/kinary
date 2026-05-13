<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\Section;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Section::getInRandomOrder(rand(10, 15))->each(fn ($section) => Lesson::factory(rand(3, 5))->for($section)->create());
    }
}
