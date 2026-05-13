<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\Lesson;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Lesson::getInRandomOrder(rand(20, 25))->each(fn ($lesson) => Content::factory(rand(5, 8))->create());
    }
}
