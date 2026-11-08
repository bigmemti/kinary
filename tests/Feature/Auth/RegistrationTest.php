<?php

use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '+989123456789',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'test@example.com')->firstOrFail();

    expect($user->phone)->toBe('09123456789')
        ->and($user->phone_verified_at)->toBeNull()
        ->and($user->wallet)->not->toBeNull()
        ->and($user->student)->not->toBeNull()
        ->and($user->getRoleNames()->sort()->values()->all())->toBe(['student', 'user']);
});

test('registration requires an Iranian mobile number', function (mixed $phone) {
    $this->post(route('register.store'), [
        'name' => 'Test User', 'email' => 'test@example.com', 'phone' => $phone,
        'password' => 'password', 'password_confirmation' => 'password',
    ])->assertSessionHasErrors('phone');
})->with([null, '12345678901', '0912345678', '+981234567890']);
