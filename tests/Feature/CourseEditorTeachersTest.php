<?php

use App\Enums\TeacherRole;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('an owner can add and remove teachers and change roles without altering other courses', function () {
    $course = Course::factory()->create();
    $otherCourse = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $removed = Teacher::factory()->create();
    $changed = Teacher::factory()->create();
    $added = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $course->teachers()->attach($removed, ['role' => TeacherRole::Assistant]);
    $course->teachers()->attach($changed, ['role' => TeacherRole::Instructor]);
    $otherCourse->teachers()->attach($removed, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => [
        ['id' => $owner->id, 'role' => 'owner'], ['id' => $changed->id, 'role' => 'editor'], ['id' => $added->id, 'role' => 'reviewer'],
    ]]);

    $response->assertRedirect(route('teacher.course.editor', $course));
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseMissing('course_teacher', ['course_id' => $course->id, 'teacher_id' => $removed->id]);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $changed->id, 'role' => 'editor']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $added->id, 'role' => 'reviewer']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $otherCourse->id, 'teacher_id' => $removed->id, 'role' => 'owner']);
    $this->get(route('teacher.course.editor', $course))->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->has('overview.teachers', 3)
            ->where('overview.teachers.1.id', $changed->id)
            ->where('overview.teachers.1.role', 'editor')
            ->where('overview.teachers.2.id', $added->id)
            ->where('overview.teachers.2.role', 'reviewer')
            ->where('overview.has_owner', true)
            ->where('overview.teachers.2.created_at', fn ($value): bool => is_string($value))
            ->missing('overview.available_teachers.0.email')
        )
    );
});

test('removing or demoting the last owner leaves all memberships unchanged', function (string $operation) {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Instructor]);
    $rows = $operation === 'remove'
        ? [['id' => $teacher->id, 'role' => 'instructor']]
        : [['id' => $owner->id, 'role' => 'editor'], ['id' => $teacher->id, 'role' => 'assistant']];

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => $rows]);

    $response->assertSessionHasErrors(['teachers' => 'دوره باید حداقل یک مالک داشته باشد. پیش از حذف یا تغییر سمت مالک آخر، مالک دیگری تعیین کنید.']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $owner->id, 'role' => 'owner']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $teacher->id, 'role' => 'instructor']);
})->with(['remove', 'demote']);

test('ownership can be transferred in one save while keeping the former owner as an editor', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $newOwner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => [
        ['id' => $owner->id, 'role' => 'editor'], ['id' => $newOwner->id, 'role' => 'owner'],
    ]]);

    $response->assertRedirect(route('teacher.course.editor', $course));
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $newOwner->id, 'role' => 'owner']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $owner->id, 'role' => 'editor']);
    $this->get(route('teacher.course.editor', $course))->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('overview.permissions.manage_teachers', false)
            ->where('overview.permissions.publish', false)
            ->where('overview.permissions.update_information', true)
            ->where('overview.available_teachers', [])
        )
    );
});

test('a departing owner returns to the course list after transferring ownership', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $newOwner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => [['id' => $newOwner->id, 'role' => 'owner']]]);

    $response->assertRedirect(route('teacher.course.index'));
    $this->assertDatabaseMissing('course_teacher', ['course_id' => $course->id, 'teacher_id' => $owner->id]);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $newOwner->id, 'role' => 'owner']);
    $this->get(route('teacher.course.editor', $course))->assertNotFound();
});

test('invalid membership rows never partly change the teacher list', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => [
        ['id' => $owner->id, 'role' => 'owner'], ['id' => $owner->id, 'role' => 'superuser'], ['id' => 999999, 'role' => 'editor'],
    ]]);

    $response->assertSessionHasErrors(['teachers.0.id', 'teachers.1.id', 'teachers.1.role', 'teachers.2.id']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $owner->id, 'role' => 'owner']);
    expect($course->teachers()->count())->toBe(1);
});

test('clearing every teacher preserves the last owner', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => []]);

    $response->assertSessionHasErrors(['teachers' => 'دوره باید حداقل یک مالک داشته باشد.']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $owner->id, 'role' => 'owner']);
});

test('unexpected teacher fields and missing identifiers or roles are rejected', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => [
        ['id' => $owner->id, 'role' => 'owner', 'course_id' => 999999],
        ['role' => 'editor'],
        ['id' => 999999],
    ]]);

    $response->assertSessionHasErrors(['teachers.0', 'teachers.1.id', 'teachers.2.role']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $owner->id, 'role' => 'owner']);
    expect($course->teachers()->count())->toBe(1);
});

test('a teacher whose global role was revoked cannot be added to a course', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $revoked = Teacher::factory()->create();
    $revoked->user->removeRole('teacher');
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => [
        ['id' => $owner->id, 'role' => 'owner'], ['id' => $revoked->id, 'role' => 'instructor'],
    ]]);

    $response->assertSessionHasErrors(['teachers.1.id' => 'مدرس انتخاب‌شده نقش فعال مدرس ندارد.']);
    $this->assertDatabaseMissing('course_teacher', ['course_id' => $course->id, 'teacher_id' => $revoked->id]);
});

test('an editor cannot promote themselves or replace course teachers', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $editor = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $course->teachers()->attach($editor, ['role' => TeacherRole::Editor]);

    $response = $this->actingAs($editor->user)->put(route('teacher.course.editor.teachers', $course), ['teachers' => [['id' => $editor->id, 'role' => 'owner']]]);

    $response->assertForbidden();
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $owner->id, 'role' => 'owner']);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $editor->id, 'role' => 'editor']);
});

test('a course without an owner does not infer management rights from its first teacher', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Instructor]);

    $response = $this->actingAs($teacher->user)->get(route('teacher.course.editor', $course));

    $response->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('overview.has_owner', false)
            ->where('overview.permissions.update_information', false)
            ->where('overview.permissions.manage_teachers', false)
            ->where('overview.permissions.publish', false)
            ->where('overview.available_teachers', [])
        )
    );
});

test('another course membership list is hidden from an unrelated owner', function () {
    $course = Course::factory()->create();
    $otherCourse = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->put(route('teacher.course.editor.teachers', $otherCourse), ['teachers' => [['id' => $owner->id, 'role' => 'owner']]]);

    $response->assertNotFound();
    $this->assertDatabaseMissing('course_teacher', ['course_id' => $otherCourse->id, 'teacher_id' => $owner->id]);
});

test('guests and users without a teacher role cannot write editor data', function () {
    $course = Course::factory()->create();
    $user = User::factory()->create();
    $information = route('teacher.course.editor.information', $course);
    $teachers = route('teacher.course.editor.teachers', $course);

    $this->patch($information, [])->assertRedirect(route('login'));
    $this->put($teachers, [])->assertRedirect(route('login'));
    $this->actingAs($user)->patch($information, [])->assertForbidden();
    $this->put($teachers, [])->assertForbidden();

    $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => $course->title]);
    expect($course->teachers()->count())->toBe(0);
});
