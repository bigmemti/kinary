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
            TeacherSeeder::class,
            CourseSeeder::class,
            SectionSeeder::class,
            LessonSeeder::class,
            PlanSeeder::class,
            EnrollmentSeeder::class,
            OrderSeeder::class,
            OrderPlanSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
