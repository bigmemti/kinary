<?php

use App\Enums\TeacherRole;
use App\Models\Access;
use App\Models\Category;
use App\Models\Content;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use Inertia\Testing\AssertableInertia as Assert;

test('published courses can be viewed without spaces or teachers', function () {
    $course = Course::factory()->create(['is_published' => true]);

    $this->get(route('course.show', $course->slug))->assertInertia(fn (Assert $page) => $page
        ->component('course/details')->where('course.id', $course->id)->where('spaces', [])
        ->where('course.teachers', []));
});

test('each space includes only its related lessons and counts each accessible content once per plan', function () {
    $course = Course::factory()->create(['is_published' => true]);
    $firstSpace = Space::factory()->for($course)->create();
    $secondSpace = Space::factory()->for($course)->create();
    $firstCategory = Category::create(['name' => 'First category']);
    $secondCategory = Category::create(['name' => 'Second category']);
    $firstSpace->categories()->attach($firstCategory);
    $secondSpace->categories()->attach($secondCategory);
    $basic = Plan::factory()->for($firstSpace)->create(['name' => 'پایه', 'description' => 'توضیح پلن پایه', 'order' => 1, 'price' => 250000]);
    $complete = Plan::factory()->for($firstSpace)->create(['name' => 'کامل', 'order' => 2]);
    $empty = Plan::factory()->for($firstSpace)->create(['name' => 'بدون محتوا', 'order' => 3]);
    $other = Plan::factory()->for($secondSpace)->create();
    $section = Section::factory()->for($course)->create(['order' => 1]);
    $sharedLesson = Lesson::factory()->for($section)->create(['order' => 1]);
    $secondLesson = Lesson::factory()->for($section)->create(['order' => 2]);
    Lesson::factory()->for($section)->create(['order' => 3]);
    $contents = Content::factory()->text()->for($sharedLesson)->count(3)->create();
    $otherContent = Content::factory()->text()->for($secondLesson)->create();
    Access::create(['content_id' => $contents[0]->id, 'plan_id' => $basic->id]);
    Access::create(['content_id' => $contents[0]->id, 'plan_id' => $complete->id]);
    Access::create(['content_id' => $contents[1]->id, 'plan_id' => $complete->id]);
    Access::create(['content_id' => $contents[2]->id, 'plan_id' => $other->id]);
    Access::create(['content_id' => $otherContent->id, 'plan_id' => $other->id]);

    $this->get(route('course.show', $course->slug))->assertInertia(fn (Assert $page) => $page
        ->has('spaces', 2)->has('spaces.0.sections', 1)->has('spaces.0.sections.0.lessons', 1)
        ->where('spaces.0.categories.0.slug', $firstCategory->slug)
        ->where('spaces.1.categories.0.slug', $secondCategory->slug)
        ->has('spaces.0.categories', 1)->has('spaces.1.categories', 1)
        ->where('spaces.0.sections.0.lessons.0.id', $sharedLesson->id)
        ->where('spaces.0.sections.0.lessons.0.contentsCount', 2)
        ->where('spaces.0.sections.0.lessons.0.planAccess', [
            ['planId' => $basic->id, 'planName' => 'پایه', 'contentsCount' => 1],
            ['planId' => $complete->id, 'planName' => 'کامل', 'contentsCount' => 2],
            ['planId' => $empty->id, 'planName' => 'بدون محتوا', 'contentsCount' => 0],
        ])
        ->where('spaces.0.plans.0.price', 250000)
        ->where('spaces.0.plans.0.description', 'توضیح پلن پایه')
        ->where('spaces.0.plans.0.contentsCount', 1)->where('spaces.0.plans.0.lessonsCount', 1)
        ->where('spaces.0.plans.1.contentsCount', 2)->where('spaces.0.plans.1.lessonsCount', 1)
        ->has('spaces.1.sections.0.lessons', 2)
        ->where('spaces.1.sections.0.lessons.0.planAccess.0.contentsCount', 1)
        ->where('spaces.1.plans.0.contentsCount', 2)->where('spaces.1.plans.0.lessonsCount', 2)
        ->missing('spaces.0.sections.0.lessons.0.contents'));
});

test('unassigned content is not public and does not create a visible lesson or section', function () {
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    Plan::factory()->for($space)->create();
    $section = Section::factory()->for($course)->create(['order' => 1]);
    $lesson = Lesson::factory()->for($section)->create(['order' => 1]);
    $content = Content::factory()->text()->for($lesson)->create(['description' => 'توضیح محرمانه']);

    $this->get(route('course.show', $course->slug))->assertInertia(fn (Assert $page) => $page
        ->where('spaces.0.sections', [])->where('spaces.0.plans.0.contentsCount', 0)
        ->where('spaces.0.plans.0.lessonsCount', 0))
        ->assertDontSee($content->description)->assertDontSee($content->contentable->body);
});

test('course page shows instructors and owner without exposing private teacher data', function () {
    $course = Course::factory()->create(['is_published' => true]);
    $owner = Teacher::factory()->create();
    $instructor = Teacher::factory()->create();
    $editor = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $course->teachers()->attach($instructor, ['role' => TeacherRole::Instructor]);
    $course->teachers()->attach($editor, ['role' => TeacherRole::Editor]);

    $this->get(route('course.show', $course->slug))->assertInertia(fn (Assert $page) => $page
        ->has('course.teachers', 2)->where('course.teachers.0.name', $owner->user->name)
        ->where('course.teachers.1.name', $instructor->user->name)->missing('course.teachers.0.email')
        ->missing('course.teachers.0.user'));
});
