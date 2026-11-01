<?php

use App\Models\Course;
use App\Models\Teacher;

test('course slugs preserve Persian and become available after deletion', function () {
    $title = "\u{0622}\u{0645}\u{0648}\u{0632}\u{0634} \u{067e}\u{06cc}\u{200c}\u{0627}\u{0686} \u{067e}\u{06cc}";
    $first = Course::factory()->create(['title' => $title]);
    $first->delete();
    $second = Course::factory()->create(['title' => $title]);

    expect($first->slug)->toBe("\u{0622}\u{0645}\u{0648}\u{0632}\u{0634}-\u{067e}\u{06cc}-\u{0627}\u{0686}-\u{067e}\u{06cc}")
        ->and($second->slug)->toBe($first->slug);

    $this->assertDatabaseMissing('courses', ['id' => $first->id]);
});

test('teacher course creation generates unique slugs when omitted', function () {
    $teacher = Teacher::factory()->create();
    $teacher->user->assignRole('teacher');
    $title = "\u{062f}\u{0648}\u{0631}\u{0647} \u{0644}\u{0627}\u{0631}\u{0627}\u{0648}\u{0644}";

    $this->actingAs($teacher->user)->post(route('teacher.course.store'), ['title' => $title])->assertSessionHasNoErrors();
    $this->post(route('teacher.course.store'), ['title' => $title])->assertSessionHasNoErrors();

    expect(Course::where('title', $title)->count())->toBe(2)
        ->and(Course::where('title', $title)->pluck('slug')->unique())->toHaveCount(2);
});
