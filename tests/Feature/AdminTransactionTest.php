<?php

use App\Enums\LedgerType;
use App\Models\Order;
use App\Models\User;
use Database\Seeders\TransactionSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

test('admin transaction pages use wallet ownership without order associations', function () {
    $admin = User::factory()->create();
    Role::findOrCreate('admin', 'web');
    $admin->assignRole('admin');
    $transaction = $admin->wallet->transactions()->create(['amount' => 50000, 'authority' => 'admin-wallet', 'gateway' => 'zarinpal']);
    Order::factory()->for($admin->wallet)->create(['amount' => 70000]);

    $this->actingAs($admin)->get(route('admin.transaction.index'))->assertInertia(fn (Assert $page) => $page
        ->component('admin/transaction/index')->where('transactions.0.wallet.id', $admin->wallet->id)
        ->missing('transactions.0.order')->missing('transactions.0.order_id'));
    $this->get(route('admin.transaction.show', $transaction))->assertInertia(fn (Assert $page) => $page
        ->where('transaction.wallet.id', $admin->wallet->id)->missing('transaction.order'));
    $this->get(route('admin.transaction.create'))->assertInertia(fn (Assert $page) => $page
        ->has('wallets', 1)->missing('orders'));
    $this->get(route('admin.transaction.edit', $transaction))->assertInertia(fn (Assert $page) => $page
        ->has('wallets', 1)->missing('orders'));
    $this->get(route('admin.order.index'))->assertInertia(fn (Assert $page) => $page
        ->has('orders', 1)->missing('orders.0.transactions_count'));
});

test('admin transaction writes accept a wallet and reject the obsolete order field', function () {
    $admin = User::factory()->create();
    Role::findOrCreate('admin', 'web');
    $admin->assignRole('admin');
    $payload = ['wallet_id' => $admin->wallet->id, 'amount' => 50000, 'gateway' => 'zarinpal', 'status' => 'pending', 'paid_at' => '2026-10-26 10:00:00'];

    $this->actingAs($admin)->post(route('admin.transaction.store'), $payload)->assertSuccessful();
    $transaction = $admin->wallet->transactions()->sole();
    $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'wallet_id' => $admin->wallet->id, 'amount' => 50000]);
    $this->put(route('admin.transaction.update', $transaction), [...$payload, 'amount' => 60000])->assertSuccessful();
    $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'amount' => 60000]);

    unset($payload['wallet_id']);
    $this->post(route('admin.transaction.store'), [...$payload, 'order_id' => 1])->assertSessionHasErrors('wallet_id');
    $this->assertDatabaseCount('transactions', 1);
});

test('seeded wallet transactions have deposit ledgers without requiring orders', function () {
    $user = User::factory()->create();

    $this->seed(TransactionSeeder::class);

    $transaction = $user->wallet->transactions()->where('status', 'paid')->sole();
    expect($user->wallet->fresh()->balance)->toBe($transaction->amount);
    expect($transaction->ledger->amount)->toBe($transaction->amount);
    expect($transaction->ledger->type)->toBe(LedgerType::Deposit);
    $this->assertDatabaseCount('transactions', 3);
    $this->assertDatabaseCount('ledgers', 1);
    $this->assertDatabaseCount('orders', 0);
});
