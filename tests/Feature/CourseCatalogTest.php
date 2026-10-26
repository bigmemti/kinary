<?php

use App\Models\Course;
use App\Models\Plan;
use App\Models\Space;
use Inertia\Testing\AssertableInertia as Assert;

test('catalog search matches published titles and descriptions and excludes drafts and deleted courses', function () {
    $titleMatch = Course::factory()->create(['title' => 'مهندسی نرم‌افزار', 'is_published' => true]);
    $descriptionMatch = Course::factory()->create(['description' => 'اصول مهندسی', 'is_published' => true]);
    Course::factory()->create(['title' => 'مهندسی پنهان', 'is_published' => false]);
    Course::factory()->create(['title' => 'مهندسی حذف شده', 'is_published' => true])->delete();
    Course::factory()->create(['title' => 'عنوان دیگر', 'is_published' => true]);

    $this->get(route('course.index', ['search' => ' مهندسی ']))->assertInertia(fn (Assert $page) => $page
        ->component('course/catalog')->where('search', 'مهندسی')->has('courses.data', 2)
        ->where('courses.data.0.id', $descriptionMatch->id)->where('courses.data.1.id', $titleMatch->id));
});

test('catalog is paginated and keeps the search in navigation links', function () {
    Course::factory()->count(13)->create(['is_published' => true, 'description' => 'آموزش']);

    $this->get(route('course.index', ['search' => 'آموزش']))->assertInertia(fn (Assert $page) => $page
        ->has('courses.data', 12)->where('courses.total', 13)->where('courses.last_page', 2)
        ->where('courses.next_page_url', fn (string $url): bool => str_contains(urldecode($url), 'search=آموزش') && str_contains($url, 'page=2')));
});

test('catalog returns an empty result for unmatched searches', function () {
    Course::factory()->create(['is_published' => true]);

    $this->get(route('course.index', ['search' => 'عبارت بی‌نتیجه']))->assertInertia(fn (Assert $page) => $page
        ->where('courses.total', 0)->where('courses.data', []));
});

test('catalog rejects invalid search input with a Persian message', function (mixed $search, string $message) {
    $this->from(route('course.index'))->get(route('course.index', ['search' => $search]))
        ->assertRedirect(route('course.index'))->assertSessionHasErrors(['search' => $message]);
})->with([
    'array' => [['invalid'], 'عبارت جستجو باید متن باشد.'],
    'too long' => [str_repeat('الف', 51), 'عبارت جستجو نباید بیشتر از ۱۵۰ نویسه باشد.'],
]);

test('unpublished courses are unavailable through their public URL', function () {
    $course = Course::factory()->create(['is_published' => false]);

    $this->get(route('course.show', $course->slug))->assertNotFound();
});

test('published course pages render plans through their learning spaces without requiring a teacher', function () {
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();

    $this->get(route('course.show', $course->slug))->assertInertia(fn (Assert $page) => $page
        ->component('course/details')->where('course.title', $course->title)
        ->where('course.teachers', [])->where('spaces.0.plans.0.name', $plan->name));
});
