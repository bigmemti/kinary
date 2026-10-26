<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('public pages use rtl direction', function (string $routeName) {
    $this->get(route($routeName))->assertSee('dir="rtl"', false)
        ->assertInertia(fn (Assert $page) => $page->where('pageDirection', 'rtl'));
})->with(['home', 'course.index', 'login', 'register']);

test('dashboard and settings use ltr direction including Inertia navigation responses', function (string $routeName) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route($routeName))->assertSee('dir="ltr"', false)
        ->assertInertia(fn (Assert $page) => $page->where('pageDirection', 'ltr'));
    $this->get(route($routeName), ['X-Inertia' => 'true', 'X-Inertia-Version' => $response->viewData('page')['version']])
        ->assertJsonPath('props.pageDirection', 'ltr');
})->with(['dashboard', 'profile.edit']);
