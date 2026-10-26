<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('authentication pages return Persian document titles and language', function (string $route, string $component, string $title) {
    $this->get(route($route))->assertSee('lang="fa"', false)->assertSee($title)
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['login', 'auth/login', 'ورود به حساب | آکادمی'],
    ['register', 'auth/register', 'ساخت حساب کاربری | آکادمی'],
]);

test('invalid credentials return a Persian login error', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'incorrect'])
        ->assertSessionHasErrors(['email' => 'ایمیل یا رمز عبور نادرست است.']);

    $this->assertGuest();
});

test('registration returns Persian errors for missing fields', function () {
    $this->post(route('register.store'), [])->assertSessionHasErrors([
        'name' => 'وارد کردن نام و نام خانوادگی الزامی است.',
        'email' => 'وارد کردن ایمیل الزامی است.',
        'password' => 'وارد کردن رمز عبور الزامی است.',
    ]);

    $this->assertGuest();
});

test('registration returns Persian errors for invalid email short password and mismatched confirmation', function () {
    $this->post(route('register.store'), [
        'name' => 'کاربر جدید', 'email' => 'invalid', 'password' => 'short', 'password_confirmation' => 'different',
    ])->assertSessionHasErrors([
        'email' => 'نشانی ایمیل معتبر وارد کنید.',
        'password' => 'رمز عبور باید حداقل 8 نویسه داشته باشد.',
    ]);

    $this->assertGuest();
});

test('registration rejects an already registered email with a Persian error', function () {
    $user = User::factory()->create();

    $this->post(route('register.store'), [
        'name' => 'کاربر جدید', 'email' => $user->email, 'password' => 'password', 'password_confirmation' => 'password',
    ])->assertSessionHasErrors(['email' => 'این ایمیل قبلاً ثبت شده است.']);

    $this->assertGuest();
});
