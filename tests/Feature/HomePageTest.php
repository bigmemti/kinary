<?php

use App\Enums\TeacherRole;
use App\Models\Category;
use App\Models\Course;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Teacher;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the Persian homepage when the catalog is empty', function () {
    $this->get(route('home'))
        ->assertSee('lang="fa"', false)
        ->assertSee('یادگیری مهندسی نرم‌افزار | آکادمی')
        ->assertInertia(fn (Assert $page) => $page->component('home')
            ->where('auth.user', null)->where('courses', [])->where('categories', [])
            ->where('teachers', [])->where('storefrontCart', []));
});

test('homepage shows only the six newest published courses and public teacher information', function () {
    $courses = Course::factory()->count(7)->create(['is_published' => true, 'created_at' => now()->subDay()]);
    Course::factory()->create(['is_published' => false]);
    $deleted = Course::factory()->create(['is_published' => true]);
    $deleted->delete();
    $owner = Teacher::factory()->create();
    $courses->last()->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('courses', 6)->where('courses.0.id', $courses->last()->id)
        ->where('courses.5.id', $courses[1]->id)
        ->where('courses.0.teacher.user.name', $owner->user->name)
        ->missing('courses.0.teacher.user.email')->missing('courses.0.teacher.user.password')
        ->where('courses.1.teacher', null));
});

test('homepage lists real categories and only teachers teaching published courses', function () {
    $category = new Category;
    $category->name = 'مهندسی نرم‌افزار';
    $category->save();
    $published = Course::factory()->create(['is_published' => true]);
    $draft = Course::factory()->create(['is_published' => false]);
    $owner = Teacher::factory()->create();
    $instructor = Teacher::factory()->create();
    $editor = Teacher::factory()->create();
    $unpublishedTeacher = Teacher::factory()->create();
    $published->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $published->teachers()->attach($instructor, ['role' => TeacherRole::Instructor]);
    $published->teachers()->attach($editor, ['role' => TeacherRole::Editor]);
    $draft->teachers()->attach($unpublishedTeacher, ['role' => TeacherRole::Owner]);

    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->has('categories', 1)->where('categories.0.name', 'مهندسی نرم‌افزار')
        ->has('teachers', 2)->where('teachers.0.id', $owner->id)
        ->where('teachers.1.id', $instructor->id)->missing('teachers.0.user'));
});

test('homepage cart belongs to the signed in user and reading it does not modify orders', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $plan = Plan::factory()->create();
    $otherPlan = Plan::factory()->create();
    $order = Order::factory()->for($user->wallet)->create(['amount' => $plan->price]);
    $order->plans()->attach($plan, ['price' => $plan->price]);
    $expired = Order::factory()->for($user->wallet)->create(['amount' => $otherPlan->price, 'updated_at' => now()->subDays(2)]);
    $expired->plans()->attach($otherPlan, ['price' => $otherPlan->price]);
    Order::factory()->for($other->wallet)->create(['amount' => $otherPlan->price])->plans()->attach($otherPlan, ['price' => $otherPlan->price]);

    $this->actingAs($user)->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('auth.user.id', $user->id)->has('storefrontCart', 1)
        ->where('storefrontCart.0.id', $plan->id)
        ->where('storefrontCart.0.courseTitle', $plan->space->course->title));

    expect($expired->fresh()->status)->toBe('pending');
    $this->assertDatabaseCount('transactions', 0);
});
