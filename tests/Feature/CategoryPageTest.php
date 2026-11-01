<?php

use App\Models\Category;
use App\Models\Course;
use App\Models\Space;
use Inertia\Testing\AssertableInertia as Assert;

test('category pages list published courses through their spaces only once', function () {
    $category = new Category;
    $category->name = 'برنامه‌نویسی';
    $category->save();
    $published = Course::factory()->create(['is_published' => true]);
    Space::factory()->count(2)->for($published)->create()->each(fn (Space $space) => $space->categories()->attach($category));
    $draft = Course::factory()->create(['is_published' => false]);
    Space::factory()->for($draft)->create()->categories()->attach($category);
    $deleted = Course::factory()->create(['is_published' => true]);
    Space::factory()->for($deleted)->create()->categories()->attach($category);
    $deleted->delete();
    Course::factory()->create(['is_published' => true]);

    $this->get(route('category.show', $category->slug))->assertInertia(fn (Assert $page) => $page
        ->component('category/show')->where('category.name', 'برنامه‌نویسی')
        ->where('category.slug', 'برنامه-نویسی')->where('canonicalUrl', route('category.show', $category->slug))
        ->where('pageDirection', 'rtl')->where('courses.total', 1)
        ->where('courses.data.0.id', $published->id));
});

test('empty categories have a page and unknown categories are not found', function () {
    $category = new Category;
    $category->name = 'خالی';
    $category->save();

    $this->get(route('category.show', $category->slug))->assertInertia(fn (Assert $page) => $page
        ->where('courses.data', [])->where('courses.total', 0));
    $this->get(route('category.show', 999999))->assertNotFound();
});

test('category pages paginate published courses', function () {
    $category = new Category;
    $category->name = 'آموزش';
    $category->save();
    Course::factory()->count(13)->create(['is_published' => true])->each(function (Course $course) use ($category): void {
        Space::factory()->for($course)->create()->categories()->attach($category);
    });

    $this->get(route('category.show', $category->slug))->assertInertia(fn (Assert $page) => $page
        ->has('courses.data', 12)->where('courses.total', 13)->where('courses.last_page', 2));
});

test('sitemap includes category URLs', function () {
    $category = new Category;
    $category->name = 'آموزش';
    $category->save();

    $this->get('/sitemap.xml')->assertOk()->assertSee(route('category.show', $category->slug), false);
});

test('category search filters titles and descriptions within the category and preserves pagination', function () {
    $category = new Category;
    $category->name = 'برنامه‌نویسی';
    $category->save();
    $other = new Category;
    $other->name = 'دیگر';
    $other->save();
    Course::factory()->count(12)->create(['is_published' => true, 'title' => 'آموزش PHP'])->each(function (Course $course) use ($category): void {
        Space::factory()->for($course)->create()->categories()->attach($category);
    });
    $descriptionMatch = Course::factory()->create(['is_published' => true, 'title' => 'دوره دیگر', 'description' => 'PHP مقدماتی']);
    Space::factory()->for($descriptionMatch)->create()->categories()->attach($category);
    $outside = Course::factory()->create(['is_published' => true, 'title' => 'PHP خارج از دسته']);
    Space::factory()->for($outside)->create()->categories()->attach($other);
    $draft = Course::factory()->create(['is_published' => false, 'title' => 'PHP پیش‌نویس']);
    Space::factory()->for($draft)->create()->categories()->attach($category);

    $this->get(route('category.show', [$category->slug, 'search' => ' PHP ']))->assertInertia(fn (Assert $page) => $page
        ->where('search', 'PHP')->where('courses.total', 13)->has('courses.data', 12)
        ->where('courses.next_page_url', fn (string $url): bool => str_contains($url, 'search=') && str_contains($url, 'page=2')));

    $this->get(route('category.show', [$category->slug, 'search' => 'ناموجود']))->assertInertia(fn (Assert $page) => $page
        ->where('courses.data', [])->where('courses.total', 0));
});

test('category search rejects invalid input', function () {
    $category = new Category;
    $category->name = 'آموزش';
    $category->save();

    $this->from(route('category.show', $category->slug))->get(route('category.show', [$category->slug, 'search' => ['invalid']]))
        ->assertRedirect(route('category.show', $category->slug))->assertSessionHasErrors(['search' => 'عبارت جستجو باید متن باشد.']);
});

test('category slugs are unique stable and used instead of numeric identifiers', function () {
    $first = new Category;
    $first->name = 'برنامه نویسی';
    $first->save();
    $second = new Category;
    $second->name = 'برنامه-نویسی';
    $second->save();

    expect($first->slug)->toBe('برنامه-نویسی');
    expect($second->slug)->toBe('برنامه-نویسی-2');
    $first->name = 'نام دیگر';
    $first->save();
    expect($first->refresh()->slug)->toBe('برنامه-نویسی');
    $this->get(route('category.show', $first->id))->assertNotFound();
    $this->get(route('category.show', $first->slug))->assertOk();
});
