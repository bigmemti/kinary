<?php

use App\Models\Course;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Space;
use App\Models\User;

test('guests must sign in before adding a plan to the cart', function () {
    $plan = Plan::factory()->create();

    $this->post(route('plan.buy', $plan))->assertRedirect(route('login'));

    $this->assertDatabaseCount('orders', 0);
});

test('adding a published plan stores its price once and does not initiate payment', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create(['price' => 250000]);
    $otherOrder = Order::factory()->for($otherUser->wallet)->create(['amount' => 0]);

    $this->actingAs($user)->post(route('plan.buy', $plan))
        ->assertRedirect(route('course.show', $course->slug))->assertSessionHas('cart_notice', 'سبد خرید به‌روز شد.');

    $this->assertDatabaseHas('orders', ['wallet_id' => $user->wallet->id, 'amount' => 250000, 'status' => 'pending']);
    $order = $user->wallet->orders()->firstOrFail();
    $this->assertDatabaseHas('order_plan', ['order_id' => $order->id, 'plan_id' => $plan->id, 'price' => 250000]);
    $this->assertDatabaseMissing('order_plan', ['order_id' => $otherOrder->id]);
    $this->assertDatabaseCount('transactions', 0);
});

test('adding a plan again keeps one item and adding another plan updates the cart total', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $first = Plan::factory()->for($space)->create(['price' => 250000]);
    $secondSpace = Space::factory()->for($course)->create();
    $second = Plan::factory()->for($secondSpace)->create(['price' => 100000]);
    $order = Order::factory()->for($user->wallet)->create(['amount' => 250000]);
    $order->plans()->attach($first, ['price' => 250000]);

    $this->actingAs($user)->post(route('plan.buy', $first))->assertRedirect(route('course.show', $course->slug));
    $this->actingAs($user)->post(route('plan.buy', $second))->assertRedirect(route('course.show', $course->slug));

    $this->assertDatabaseCount('orders', 1);
    $this->assertDatabaseCount('order_plan', 2);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'amount' => 350000]);
});

test('plans from unpublished courses cannot be added to a cart', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_published' => false]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();

    $this->actingAs($user)->post(route('plan.buy', $plan))->assertNotFound();

    $this->assertDatabaseCount('orders', 0);
});

test('opening an add-to-cart URL cannot mutate the cart', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->create();

    $this->actingAs($user)->get(route('plan.buy', $plan))->assertMethodNotAllowed();

    $this->assertDatabaseCount('orders', 0);
});
