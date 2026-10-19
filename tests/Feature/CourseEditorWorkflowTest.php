<?php

use App\Enums\TeacherRole;
use App\Models\Course;
use App\Models\Teacher;
use Inertia\Testing\AssertableInertia as Assert;

test('owner completes the editor workflow and saved data survives reopening', function () {
    $owner = Teacher::factory()->create();
    $editor = Teacher::factory()->create();
    $course = Course::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $this->actingAs($owner->user);
    $url = route('teacher.course.editor', $course);
    $this->get($url)->assertInertia(fn (Assert $page) => $page->component('teacher/course/editor'));

    $this->patch(route('teacher.course.editor.information', $course), [
        'title' => 'Complete course', 'slug' => 'complete-course', 'description' => 'Course description', 'is_published' => false,
    ])->assertRedirect($url)->assertSessionHasNoErrors();
    $this->put(route('teacher.course.editor.teachers', $course), ['teachers' => [
        ['id' => $owner->id, 'role' => 'owner'], ['id' => $editor->id, 'role' => 'editor'],
    ]])->assertRedirect($url)->assertSessionHasNoErrors();
    $this->post(route('teacher.course.space.store', $course), ['name' => 'Main space'])->assertRedirect($url)->assertSessionHasNoErrors();
    $space = $course->spaces()->firstOrFail();
    $this->post(route('teacher.space.plan.store', $space), ['name' => 'Main plan', 'price' => 1500])->assertRedirect($url)->assertSessionHasNoErrors();
    $plan = $space->plans()->firstOrFail();
    $this->post(route('teacher.course.section.store', $course), ['name' => 'First section'])->assertRedirect($url)->assertSessionHasNoErrors();
    $section = $course->sections()->firstOrFail();
    $this->post(route('teacher.section.lesson.store', $section), ['name' => 'First lesson'])->assertRedirect($url)->assertSessionHasNoErrors();
    $lesson = $section->lessons()->firstOrFail();
    $this->patch(route('teacher.lesson.editor.update', $lesson), [
        'name' => 'Edited lesson', 'order' => 3, 'update_pricings' => true, 'pricings' => [['plan_id' => $plan->id, 'price' => 0]],
    ])->assertRedirect($url)->assertSessionHasNoErrors();
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), [
        'type' => 'text', 'body' => 'First body', 'description' => 'Introduction', 'accesses' => [['plan_id' => $plan->id]],
    ])->assertRedirect($url)->assertSessionHasNoErrors();
    $content = $lesson->contents()->firstOrFail();
    $this->patch(route('teacher.content.editor.update', $content), ['type' => 'text', 'body' => 'Final body', 'description' => 'Saved introduction'])->assertRedirect($url)->assertSessionHasNoErrors();

    $this->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('course.title', 'Complete course')
        ->loadDeferredProps(fn (Assert $saved) => $saved
            ->has('overview.teachers', 2)
            ->where('overview.spaces.0.name', 'Main space')
            ->where('overview.spaces.0.plans.0.price', 1500)
            ->where('overview.sections.0.name', 'First section')
            ->where('overview.sections.0.lessons.0.name', 'Edited lesson')
            ->where('overview.sections.0.lessons.0.pricings.0.price', 0)
            ->where('overview.sections.0.lessons.0.contents.0.id', $content->id)
            ->where('overview.sections.0.lessons.0.contents.0.body', 'Final body')
            ->where('overview.sections.0.lessons.0.contents.0.accesses.0.plan_id', $plan->id)));
});
