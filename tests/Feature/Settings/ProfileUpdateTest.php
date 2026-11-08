<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '۰۹۱۲۳۴۵۶۷۸۹',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->phone)->toBe('09123456789');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
            'phone' => $user->phone,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('changing a mobile number clears its verification timestamp', function () {
    $user = User::factory()->create();
    $user->forceFill(['phone_verified_at' => now()])->save();

    $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name, 'email' => $user->email, 'phone' => '+989111111111',
    ])->assertSessionHasNoErrors();

    expect($user->fresh()->phone)->toBe('09111111111')->and($user->fresh()->phone_verified_at)->toBeNull();
});

test('profile requires a mobile number even for an existing user', function () {
    $user = User::factory()->create(['phone' => null]);
    $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name, 'email' => $user->email,
    ])->assertSessionHasErrors('phone');
});

// test('user can delete their account', function () {
//     $user = User::factory()->create();

//     $response = $this
//         ->actingAs($user)
//         ->delete(route('profile.destroy'), [
//             'password' => 'password',
//         ]);

//     $response
//         ->assertSessionHasNoErrors()
//         ->assertRedirect(route('home'));

//     $this->assertGuest();
//     expect($user->fresh())->toBeNull();
// });

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
