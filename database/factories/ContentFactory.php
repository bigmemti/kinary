<?php

namespace Database\Factories;

use App\Models\Content;
use App\Models\TextContent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Content>
 */
class ContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'description' => fake()->sentence(),
            'order' => fake()->numberBetween(0, 100),
        ];
    }

    public function text(): static
    {
        return $this->state(function (): array {
            $text = TextContent::query()->create(['body' => fake()->text(250)]);

            return ['contentable_type' => TextContent::class, 'contentable_id' => $text->id];
        });
    }
}
