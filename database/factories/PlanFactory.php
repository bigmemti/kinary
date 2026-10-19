<?php

namespace Database\Factories;

use App\Models\Plan;
use App\Models\Space;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'space_id' => Space::factory(),
            'order' => 1,
            'name' => fake()->text(10),
            'price' => fake()->numberBetween(10, 99) * 10000,
        ];
    }
}
