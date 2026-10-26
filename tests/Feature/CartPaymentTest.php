<?php

use App\Enums\LedgerType;
use App\Models\Course;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Space;
use App\Models\User;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use Illuminate\Support\Facades\Schema;

/** @return array{User, Order, Plan} */
function paymentCart(): array
{
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create(['order' => 2, 'price' => 250000]);
    $order = Order::factory()->for($user->wallet)->create(['amount' => 250000]);
    $order->plans()->attach($plan, ['price' => 250000]);

    return [$user, $order, $plan];
}

/** @param list<array<string, mixed>> $responses
 * @param  array<int, mixed>  $history
 */
function fakeCartGateway(array $responses, array &$history): void
{
    $handler = HandlerStack::create(new MockHandler(array_map(
        fn (array $body): Response => new Response(200, [], json_encode($body)), $responses
    )));
    $handler->push(Middleware::history($history));
    app()->instance(Client::class, new Client(['handler' => $handler]));
}

test('checkout requires authentication and rejects an empty cart without a gateway call', function () {
    $history = [];
    fakeCartGateway([], $history);
    $this->post(route('checkout'))->assertRedirect(route('login'));
    $this->get(route('callback'))->assertRedirect(route('login'));
    $user = User::factory()->create();

    $this->actingAs($user)->from(route('cart.index'))->post(route('checkout'))->assertSessionHasErrors('cart');

    expect($history)->toBe([]);
    $this->assertDatabaseCount('transactions', 0);
    $this->assertDatabaseCount('ledgers', 0);
});

test('upgrade checkout tops up only the wallet shortfall then records a separate purchase debit once', function () {
    [$user, $order, $plan] = paymentCart();
    $basic = Plan::factory()->for($plan->space)->create(['order' => 1, 'price' => 100000]);
    $user->student->plans()->attach($basic, ['is_active' => true]);
    $order->plans()->updateExistingPivot($plan, ['price' => 150000]);
    $user->wallet->balance = 40000;
    $user->wallet->save();
    $history = [];
    fakeCartGateway([['data' => ['code' => 100, 'authority' => 'sandbox-upgrade']], ['data' => ['code' => 100]]], $history);

    $this->actingAs($user)->post(route('checkout'), [], ['X-Inertia' => 'true'])
        ->assertStatus(409)->assertHeader('X-Inertia-Location', 'https://sandbox.zarinpal.com/pg/StartPay/sandbox-upgrade');

    $body = json_decode($history[0]['request']->getBody(), true);
    expect($body['amount'])->toBe(1100000);
    expect($body['currency'])->toBe('IRR');
    expect($body['callback_url'])->toBe(route('callback'));
    expect(Schema::hasColumn('transactions', 'order_id'))->toBeFalse();
    $transaction = $user->wallet->transactions()->sole();
    expect($transaction->amount)->toBe(110000);
    expect($transaction->ledger_id)->toBeNull();
    $this->assertDatabaseCount('ledgers', 0);
    $this->assertDatabaseMissing('enrollments', ['student_id' => $user->student->id, 'plan_id' => $plan->id]);

    $this->get(route('callback', ['Authority' => 'sandbox-upgrade', 'Status' => 'OK']))->assertRedirect(route('dashboard'));
    $this->get(route('callback', ['Authority' => 'sandbox-upgrade', 'Status' => 'OK']))->assertRedirect(route('dashboard'));

    expect($history)->toHaveCount(2);
    expect(json_decode($history[1]['request']->getBody(), true)['amount'])->toBe(1100000);
    expect($user->wallet->fresh()->balance)->toBe(0);
    expect($transaction->fresh()->ledger->type)->toBe(LedgerType::Deposit);
    expect($transaction->fresh()->ledger->amount)->toBe(110000);
    $this->assertDatabaseHas('ledgers', ['wallet_id' => $user->wallet->id, 'amount' => 150000, 'type' => 'payment']);
    $this->assertDatabaseCount('ledgers', 2);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'status' => 'paid']);
    $this->assertDatabaseHas('enrollments', ['student_id' => $user->student->id, 'plan_id' => $plan->id, 'is_active' => true]);
    $this->assertDatabaseCount('enrollments', 2);
});

test('sufficient wallet balance purchases without a gateway transaction and keeps the remainder', function (int $balance, int $remaining) {
    [$user, $order, $plan] = paymentCart();
    $user->wallet->balance = $balance;
    $user->wallet->save();
    $history = [];
    fakeCartGateway([], $history);

    $this->actingAs($user)->post(route('checkout'))->assertRedirect(route('dashboard'));
    $this->post(route('checkout'))->assertSessionHasErrors('cart');

    expect($history)->toBe([]);
    expect($user->wallet->fresh()->balance)->toBe($remaining);
    $this->assertDatabaseCount('transactions', 0);
    $this->assertDatabaseCount('ledgers', 1);
    $this->assertDatabaseHas('ledgers', ['wallet_id' => $user->wallet->id, 'amount' => 250000, 'type' => 'payment']);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
    $this->assertDatabaseHas('enrollments', ['student_id' => $user->student->id, 'plan_id' => $plan->id, 'is_active' => true]);
})->with(['exact' => [250000, 0], 'surplus' => [320000, 70000]]);

test('pending wallet topup can resume while cart plans remain editable', function () {
    [$user, $order, $plan] = paymentCart();
    $replacement = Plan::factory()->for($plan->space)->create(['order' => 3, 'price' => 400000]);
    $history = [];
    fakeCartGateway([['data' => ['code' => 100, 'authority' => 'sandbox-pending']]], $history);

    $this->actingAs($user)->post(route('checkout'))->assertRedirect('https://sandbox.zarinpal.com/pg/StartPay/sandbox-pending');
    $this->post(route('checkout'))->assertRedirect('https://sandbox.zarinpal.com/pg/StartPay/sandbox-pending');
    $this->delete(route('cart.destroy', $plan))->assertRedirect()->assertSessionHasNoErrors();
    $this->post(route('plan.buy', $replacement))->assertRedirect()->assertSessionHasNoErrors();

    expect($history)->toHaveCount(1);
    $this->assertDatabaseCount('transactions', 1);
    $this->assertDatabaseMissing('order_plan', ['order_id' => $order->id, 'plan_id' => $plan->id]);
    $this->assertDatabaseHas('order_plan', ['order_id' => $order->id, 'plan_id' => $replacement->id]);
});

test('cancelled and rejected verification leave wallet and access unchanged', function (string $status, int $code) {
    [$user, $order, $plan] = paymentCart();
    $transaction = $user->wallet->transactions()->create(['amount' => 250000, 'authority' => 'sandbox-failed', 'gateway' => 'zarinpal']);
    $history = [];
    fakeCartGateway([['data' => ['code' => $code]]], $history);

    $this->actingAs($user)->get(route('callback', ['Authority' => 'sandbox-failed', 'Status' => $status]))
        ->assertRedirect(route('cart.index'))->assertSessionHasErrors('cart');

    $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'status' => 'failed', 'ledger_id' => null]);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
    expect($user->wallet->fresh()->balance)->toBe(0);
    $this->assertDatabaseCount('ledgers', 0);
    $this->assertDatabaseCount('enrollments', 0);
    expect($history)->toHaveCount($status === 'OK' ? 1 : 0);
    $this->delete(route('cart.destroy', $plan))->assertRedirect();
    $this->assertDatabaseMissing('order_plan', ['order_id' => $order->id]);
})->with(['cancelled' => ['NOK', 100], 'rejected' => ['OK', -21]]);

test('another users transaction cannot credit the wallet or activate access', function () {
    [$owner] = paymentCart();
    $other = User::factory()->create();
    $transaction = $owner->wallet->transactions()->create(['amount' => 250000, 'authority' => 'other-user', 'gateway' => 'zarinpal']);
    $history = [];
    fakeCartGateway([], $history);

    $this->actingAs($other)->get(route('callback', ['Authority' => 'other-user', 'Status' => 'OK']))
        ->assertRedirect(route('cart.index'))->assertSessionHasErrors('cart');

    expect($history)->toBe([]);
    $this->assertDatabaseCount('enrollments', 0);
    $this->assertDatabaseCount('ledgers', 0);
    $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'status' => 'pending']);
});

test('successful topup purchases the current active order instead of the expired cart and replay never buys another order', function () {
    $this->freezeTime();
    [$user, $oldOrder, $oldPlan] = paymentCart();
    $user->wallet->transactions()->create(['amount' => 250000, 'authority' => 'old-cart', 'gateway' => 'zarinpal']);
    $oldOrder->forceFill(['updated_at' => now()->subDays(2)])->save();
    $newPlan = Plan::factory()->for($oldPlan->space)->create(['price' => 180000, 'order' => 3]);
    $newOrder = Order::factory()->for($user->wallet)->create(['amount' => 180000]);
    $newOrder->plans()->attach($newPlan, ['price' => 180000]);
    $history = [];
    fakeCartGateway([['data' => ['code' => 101]]], $history);

    $this->actingAs($user)->get(route('callback', ['Authority' => 'old-cart', 'Status' => 'OK']))->assertRedirect(route('dashboard'));
    $laterPlan = Plan::factory()->for(Space::factory()->for($oldPlan->space->course)->create())->create(['price' => 50000]);
    $laterOrder = Order::factory()->for($user->wallet)->create(['amount' => 50000]);
    $laterOrder->plans()->attach($laterPlan, ['price' => 50000]);
    $this->get(route('callback', ['Authority' => 'old-cart', 'Status' => 'OK']))->assertRedirect(route('dashboard'));

    expect($history)->toHaveCount(1);
    expect($user->wallet->fresh()->balance)->toBe(70000);
    $this->assertDatabaseHas('orders', ['id' => $oldOrder->id, 'status' => 'pending']);
    $this->assertDatabaseHas('orders', ['id' => $newOrder->id, 'status' => 'paid']);
    $this->assertDatabaseHas('orders', ['id' => $laterOrder->id, 'status' => 'pending']);
    $this->assertDatabaseHas('enrollments', ['student_id' => $user->student->id, 'plan_id' => $newPlan->id]);
    $this->assertDatabaseMissing('enrollments', ['student_id' => $user->student->id, 'plan_id' => $oldPlan->id]);
    $this->assertDatabaseCount('ledgers', 2);
});

test('successful topup remains credited when the active cart cannot be purchased', function (string $change) {
    [$user, $order, $plan] = paymentCart();
    $transaction = $user->wallet->transactions()->create(['amount' => 200000, 'authority' => 'wallet-credit', 'gateway' => 'zarinpal']);
    if ($change === 'empty') {
        $order->plans()->detach();
    } elseif ($change === 'expired') {
        $order->forceFill(['updated_at' => now()->subDays(2)])->save();
    } elseif ($change === 'price') {
        $plan->update(['price' => 300000]);
    } elseif ($change === 'unpublished') {
        $plan->space->course->update(['is_published' => false]);
    }
    $history = [];
    fakeCartGateway([['data' => ['code' => 100]]], $history);

    $this->actingAs($user)->get(route('callback', ['Authority' => 'wallet-credit', 'Status' => 'OK']))
        ->assertRedirect(route('cart.index'))->assertSessionHas('cart_notice');
    $this->get(route('callback', ['Authority' => 'wallet-credit', 'Status' => 'OK']))->assertRedirect(route('dashboard'));

    expect($history)->toHaveCount(1);
    expect($user->wallet->fresh()->balance)->toBe(200000);
    expect($transaction->fresh()->ledger->amount)->toBe(200000);
    $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'status' => 'paid']);
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
    $this->assertDatabaseCount('ledgers', 1);
    $this->assertDatabaseCount('enrollments', 0);
})->with(['insufficient', 'empty', 'expired', 'price', 'unpublished']);

test('changed prices and unpublished courses cannot be checked out', function (string $change) {
    [$user, $order, $plan] = paymentCart();
    if ($change === 'price') {
        $plan->update(['price' => 300000]);
    } else {
        $plan->space->course->update(['is_published' => false]);
    }
    $history = [];
    fakeCartGateway([], $history);

    $response = $this->actingAs($user)->post(route('checkout'));
    if ($change === 'price') {
        $response->assertSessionHasErrors('cart');
    } else {
        $response->assertNotFound();
    }
    expect($history)->toBe([]);
    $this->assertDatabaseCount('transactions', 0);
    $this->assertDatabaseCount('ledgers', 0);
})->with(['price', 'publication']);

test('invalid gateway request responses do not persist a transaction', function () {
    [$user] = paymentCart();
    $history = [];
    fakeCartGateway([['errors' => ['code' => -9]]], $history);

    $this->actingAs($user)->post(route('checkout'))->assertRedirect(route('cart.index'))->assertSessionHasErrors('cart');

    expect($history)->toHaveCount(1);
    $this->assertDatabaseCount('transactions', 0);
    $this->assertDatabaseCount('ledgers', 0);
});
