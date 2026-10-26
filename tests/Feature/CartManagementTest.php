<?php

use App\Models\Course;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Space;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function managementPlan(?Space $space = null, array $attributes = []): Plan
{
    $space ??= Space::factory()->for(Course::factory()->create(['is_published' => true]))->create();

    return Plan::factory()->for($space)->create([...['order' => 1, 'price' => 100000], ...$attributes]);
}

test('cart page and removal require authentication', function () {
    $plan = managementPlan();

    $this->get(route('cart.index'))->assertRedirect(route('login'));
    $this->delete(route('cart.destroy', $plan))->assertRedirect(route('login'));
});

test('cart displays only the current users items and their payable total', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $user->wallet->balance = 60000;
    $user->wallet->save();
    $plan = managementPlan();
    Order::factory()->for($user->wallet)->create(['amount' => 100000])->plans()->attach($plan, ['price' => 100000]);
    Order::factory()->for($other->wallet)->create(['amount' => 50000])->plans()->attach($plan, ['price' => 50000]);

    $this->actingAs($user)->get(route('cart.index'))->assertInertia(fn (Assert $page) => $page
        ->component('course/cart')->has('items', 1)->where('items.0.id', $plan->id)
        ->where('items.0.price', 100000)->where('total', 100000)->where('balance', 60000)->where('payableAmount', 40000)->where('pageDirection', 'rtl'));
});

test('a removed course does not prevent viewing its cart item and removing it', function () {
    $user = User::factory()->create();
    $plan = managementPlan();
    $order = Order::factory()->for($user->wallet)->create(['amount' => 100000]);
    $order->plans()->attach($plan, ['price' => 100000]);
    $plan->space->course->delete();

    $this->actingAs($user)->get(route('cart.index'))->assertInertia(fn (Assert $page) => $page
        ->where('items.0.courseTitle', 'دوره در دسترس نیست')->where('items.0.courseSlug', null));
    $this->delete(route('cart.destroy', $plan))->assertRedirect();

    $this->assertDatabaseMissing('order_plan', ['order_id' => $order->id, 'plan_id' => $plan->id]);
});

test('removing a plan changes only the users active cart and recalculates its total', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $plan = managementPlan();
    $remaining = managementPlan(null, ['price' => 40000]);
    $order = Order::factory()->for($user->wallet)->create(['amount' => 140000]);
    $order->plans()->attach([$plan->id => ['price' => 100000], $remaining->id => ['price' => 40000]]);
    $otherOrder = Order::factory()->for($other->wallet)->create(['amount' => 100000]);
    $otherOrder->plans()->attach($plan, ['price' => 100000]);

    $this->actingAs($user)->from(route('cart.index'))->delete(route('cart.destroy', $plan))->assertRedirect(route('cart.index'));

    $this->assertDatabaseMissing('order_plan', ['order_id' => $order->id, 'plan_id' => $plan->id]);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'amount' => 40000]);
    $this->assertDatabaseHas('order_plan', ['order_id' => $otherOrder->id, 'plan_id' => $plan->id]);
});

test('selecting another plan replaces only the plan in the same space', function () {
    $user = User::factory()->create();
    $first = managementPlan();
    $replacement = managementPlan($first->space, ['price' => 250000, 'order' => 2]);
    $unrelated = managementPlan(null, ['price' => 40000]);
    $order = Order::factory()->for($user->wallet)->create(['amount' => 140000]);
    $order->plans()->attach([$first->id => ['price' => 100000], $unrelated->id => ['price' => 40000]]);

    $this->actingAs($user)->post(route('plan.buy', $replacement))->assertRedirect(route('course.show', $first->space->course->slug));

    $this->assertDatabaseMissing('order_plan', ['order_id' => $order->id, 'plan_id' => $first->id]);
    $this->assertDatabaseHas('order_plan', ['order_id' => $order->id, 'plan_id' => $replacement->id, 'price' => 250000]);
    $this->assertDatabaseHas('order_plan', ['order_id' => $order->id, 'plan_id' => $unrelated->id]);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'amount' => 290000]);
    $this->get(route('course.show', $first->space->course->slug))->assertInertia(fn (Assert $page) => $page
        ->where('spaces.0.plans.0.action', 'replace')->where('spaces.0.plans.1.action', 'remove'));
});

test('upgrade charges the price difference from the highest active enrolled plan', function () {
    $user = User::factory()->create();
    $basic = managementPlan();
    $middle = managementPlan($basic->space, ['price' => 180000, 'order' => 2]);
    $higher = managementPlan($basic->space, ['price' => 250000, 'order' => 3]);
    $user->student->plans()->attach([$basic->id => ['is_active' => true], $middle->id => ['is_active' => true]]);

    $this->actingAs($user)->post(route('plan.buy', $higher))->assertRedirect(route('course.show', $basic->space->course->slug));

    $order = $user->wallet->orders()->firstOrFail();
    $this->assertDatabaseHas('order_plan', ['order_id' => $order->id, 'plan_id' => $higher->id, 'price' => 70000]);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'amount' => 70000]);
    $this->assertDatabaseMissing('enrollments', ['student_id' => $user->student->id, 'plan_id' => $higher->id]);
});

test('enrolled and lower or equal ranked plans cannot be selected even by direct requests', function (int $targetOrder) {
    $user = User::factory()->create();
    $current = managementPlan(null, ['order' => 2]);
    $target = managementPlan($current->space, ['order' => $targetOrder, 'price' => 0]);
    $user->student->plans()->attach($current, ['is_active' => true]);

    $this->actingAs($user)->post(route('plan.buy', $target))->assertSessionHasErrors('cart');

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseMissing('enrollments', ['student_id' => $user->student->id, 'plan_id' => $target->id]);
})->with(['lower' => 1, 'same rank' => 2]);

test('free participation immediately enrolls once without an order or transaction', function () {
    $user = User::factory()->create();
    $free = managementPlan(null, ['price' => 0]);

    $this->actingAs($user)->post(route('plan.buy', $free))->assertRedirect(route('course.show', $free->space->course->slug));
    $this->post(route('plan.buy', $free))->assertSessionHasErrors('cart');

    $this->assertDatabaseHas('enrollments', ['student_id' => $user->student->id, 'plan_id' => $free->id, 'is_active' => true]);
    $this->assertDatabaseCount('enrollments', 1);
    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('transactions', 0);
});

test('free participation removes only a pending selection in its own space', function () {
    $user = User::factory()->create();
    $paid = managementPlan();
    $free = managementPlan($paid->space, ['price' => 0]);
    $other = managementPlan(null, ['price' => 50000]);
    $order = Order::factory()->for($user->wallet)->create(['amount' => 150000]);
    $order->plans()->attach([$paid->id => ['price' => 100000], $other->id => ['price' => 50000]]);

    $this->actingAs($user)->post(route('plan.buy', $free))->assertRedirect();

    $this->assertDatabaseMissing('order_plan', ['order_id' => $order->id, 'plan_id' => $paid->id]);
    $this->assertDatabaseHas('order_plan', ['order_id' => $order->id, 'plan_id' => $other->id]);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'amount' => 50000]);
    $this->assertDatabaseHas('enrollments', ['student_id' => $user->student->id, 'plan_id' => $free->id]);
});

test('course plan actions reflect enrollment rank and ignore inactive enrollment', function () {
    $user = User::factory()->create();
    $low = managementPlan();
    $current = managementPlan($low->space, ['price' => 180000, 'order' => 2]);
    $higher = managementPlan($low->space, ['price' => 250000, 'order' => 3]);
    $user->student->plans()->attach([$current->id => ['is_active' => true], $higher->id => ['is_active' => false]]);

    $this->actingAs($user)->get(route('course.show', $low->space->course->slug))->assertInertia(fn (Assert $page) => $page
        ->where('spaces.0.plans.0.action', 'unavailable')->where('spaces.0.plans.1.action', 'enrolled')
        ->where('spaces.0.plans.2.action', 'upgrade')->where('spaces.0.plans.2.payablePrice', 70000));
});
