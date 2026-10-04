<?php

use App\Enums\TeacherRole;
use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

test('course teacher returns the owner as a single model', function () {
    $course = Course::factory()->create();
    $instructor = Teacher::factory()->create();
    $owner = Teacher::factory()->create();

    $course->teachers()->attach($instructor, ['role' => TeacherRole::Instructor]);
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    expect($course->teacher())->toBeInstanceOf(HasOneThrough::class)
        ->and($course->teacher)->toBeInstanceOf(Teacher::class)
        ->and($course->teacher->is($owner))->toBeTrue()
        ->and($course->teachers)->toHaveCount(2);
});

test('course owners can be eager loaded with their users and serialized as objects', function () {
    $courses = Course::factory()->count(2)->create();
    $owners = Teacher::factory()->count(2)->create();

    foreach ($courses as $index => $course) {
        $course->teachers()->attach($owners[$index], ['role' => TeacherRole::Owner]);
    }

    $loadedCourses = Course::with('teacher.user')->whereKey($courses->modelKeys())->orderBy('id')->get();

    foreach ($loadedCourses as $index => $course) {
        expect($course->teacher)->toBeInstanceOf(Teacher::class)
            ->and($course->teacher->is($owners[$index]))->toBeTrue()
            ->and($course->teacher->relationLoaded('user'))->toBeTrue()
            ->and($course->toArray()['teacher']['id'])->toBe($owners[$index]->id);
    }
});

test('course teacher is null when no owner exists', function () {
    $course = Course::factory()->create();
    $course->teachers()->attach(Teacher::factory()->create(), ['role' => TeacherRole::Instructor]);

    expect($course->teacher)->toBeNull()
        ->and($course->fresh()->load('teacher.user')->toArray()['teacher'])->toBeNull();
});
