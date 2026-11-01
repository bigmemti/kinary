<?php

use App\Enums\TeacherRole;
use App\Models\Category;
use App\Models\Course;
use App\Models\Section;
use App\Models\Teacher;

test('deleting a course removes its teacher associations without deleting the teacher', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);

    $course->delete();

    $this->assertDatabaseMissing('course_teacher', ['course_id' => $course->id, 'teacher_id' => $teacher->id]);
    $this->assertModelExists($teacher);
});

test('teacher and category descriptions can be saved', function () {
    $teacher = Teacher::factory()->create(['description' => 'Teacher biography']);
    $category = new Category;
    $category->name = 'Programming';
    $category->description = 'Category description';
    $category->save();

    expect($teacher->fresh()->description)->toBe('Teacher biography')
        ->and($category->fresh()->description)->toBe('Category description');
});

test('sections can identify their parent and children', function () {
    $course = Course::factory()->create();
    $parent = Section::factory()->for($course)->create(['order' => 1]);
    $child = Section::factory()->for($course)->create(['parent_id' => $parent->id, 'order' => 2]);

    expect($parent->fresh()->parent)->toBeNull()
        ->and($child->parent->id)->toBe($parent->id)
        ->and($parent->children->modelKeys())->toBe([$child->id]);
});
