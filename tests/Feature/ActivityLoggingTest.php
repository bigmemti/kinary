<?php

use App\Models\Order;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Events\TwoFactorAuthenticationFailed;

it('records successful and failed logins without storing passwords', function (): void {
    $user = User::factory()->withoutTwoFactor()->create();
    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'incorrect-secret']);
    $failed = DB::table('activity_logs')->where('event', 'auth.login')->where('outcome', 'failure')->first();
    expect($failed)->not->toBeNull()
        ->and(json_decode($failed->properties, true)['username'])->toBe($user->email)
        ->and($failed->properties)->not->toContain('incorrect-secret');
    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);
    $this->assertDatabaseHas('activity_logs', ['event' => 'auth.login', 'outcome' => 'success', 'actor_id' => $user->id]);
});

it('records model changes without sensitive values', function (): void {
    $user = User::factory()->create(['password' => 'private-password']);
    $log = DB::table('activity_logs')->where('event', 'model.created')->where('subject_type', User::class)->where('subject_id', $user->id)->first();
    expect($log)->not->toBeNull()->and($log->properties)->not->toContain('private-password');
});

it('records searches but not ordinary page visits', function (): void {
    $this->get(route('course.index'));
    $this->assertDatabaseMissing('activity_logs', ['event' => 'search.courses']);
    $this->get(route('course.index', ['search' => 'Laravel']));
    $log = DB::table('activity_logs')->where('event', 'search.courses')->first();
    expect($log)->not->toBeNull()->and(json_decode($log->properties, true)['search'])->toBe('Laravel');
});

it('records original and updated values for changes and excludes secrets', function (): void {
    $user = User::factory()->create(['name' => 'Before']);
    $user->update(['name' => 'After', 'password' => 'new-secret']);
    $log = DB::table('activity_logs')->where('event', 'model.updated')->where('subject_type', User::class)->where('subject_id', $user->id)->latest('id')->first();
    $properties = json_decode($log->properties, true);
    expect($properties['before']['name'])->toBe('Before')
        ->and($properties['after']['name'])->toBe('After')
        ->and($properties['before'])->not->toHaveKey('password')
        ->and($properties['after'])->not->toHaveKey('password');
});

it('records role changes and keeps them with the affected user', function (): void {
    $user = User::factory()->create();
    $user->assignRole('teacher');
    $roleId = DB::table('roles')->where('name', 'teacher')->value('id');
    $log = DB::table('activity_logs')->where('event', 'role.attach.requested')->where('subject_type', User::class)->where('subject_id', $user->id)->latest('id')->first();
    expect($log)->not->toBeNull()->and(json_decode($log->properties, true)['ids'])->toContain($roleId)
        ->and(json_decode($log->properties, true)['current_ids'])->toContain($roleId);
    $user->removeRole('teacher');
    $this->assertDatabaseHas('activity_logs', ['event' => 'role.detach.requested', 'subject_id' => $user->id, 'subject_type' => User::class]);
});

it('records before and after relationship changes and rolls them back with the transaction', function (): void {
    $user = User::factory()->create();
    $logger = app(ActivityLogger::class);
    $logger->recordChanges('test.changed', [['id' => 1]], [['id' => 2]], $user);
    $log = DB::table('activity_logs')->where('event', 'test.changed')->sole();
    expect(json_decode($log->properties, true))->toBe(['before' => [['id' => 1]], 'after' => [['id' => 2]]]);
    DB::beginTransaction();
    $logger->recordChanges('test.rolled_back', [], [['id' => 1]], $user);
    DB::rollBack();
    $this->assertDatabaseMissing('activity_logs', ['event' => 'test.rolled_back']);
});

it('records security events without storing second factor secrets', function (): void {
    $user = User::factory()->create();
    event(new TwoFactorAuthenticationFailed($user));
    $this->assertDatabaseHas('activity_logs', ['event' => 'auth.two_factor.failed', 'outcome' => 'failure', 'subject_id' => $user->id]);
});

it('records automatic order expiration with before and after status', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->for($user->wallet)->create(['status' => 'pending', 'amount' => 100, 'updated_at' => now()->subDays(2)]);
    $user->updateOrders();
    $log = DB::table('activity_logs')->where('event', 'orders.expired')->sole();
    $properties = json_decode($log->properties, true);
    expect($properties['before'][0]['status'])->toBe('pending')
        ->and($properties['after'][0]['status'])->toBe('expired')
        ->and($properties['after'][0]['id'])->toBe($order->id);
});

it('stores only created relationship data for a new association', function (): void {
    $logger = app(ActivityLogger::class);
    $logger->recordChanges('test.created', [], [['id' => 2]]);
    $log = DB::table('activity_logs')->where('event', 'test.created')->sole();
    expect(json_decode($log->properties, true))->toBe(['attributes' => [['id' => 2]]]);
});
