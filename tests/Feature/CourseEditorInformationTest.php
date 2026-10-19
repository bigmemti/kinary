<?php

use App\Enums\TeacherRole;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;

test('editor information permissions follow the teaching role in the same course', function (TeacherRole $role, bool $canEdit, bool $canManage) {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => $role]);

    $gate = Gate::forUser($teacher->user);

    expect($gate->allows('updateEditorInformation', $course))->toBe($canEdit);
    expect($gate->allows('publishEditorCourse', $course))->toBe($canManage);
    expect($gate->allows('manageEditorTeachers', $course))->toBe($canManage);
})->with([
    'owner' => [TeacherRole::Owner, true, true],
    'editor' => [TeacherRole::Editor, true, false],
    'instructor' => [TeacherRole::Instructor, false, false],
    'assistant' => [TeacherRole::Assistant, false, false],
    'reviewer' => [TeacherRole::Reviewer, false, false],
]);

test('an owner saves course information and publication and sees it on reopening', function () {
    $course = Course::factory()->create(['is_published' => true]);
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $data = [
        'title' => 'Updated course', 'slug' => 'updated-course', 'description' => 'Saved description',
        'thumbnail' => 'https://example.com/cover.jpg', 'intro_video_url' => 'https://example.com/intro.mp4', 'is_published' => false,
        'teacher_id' => 999999,
    ];

    $response = $this->actingAs($owner->user)->patch(route('teacher.course.editor.information', $course), $data);

    $response->assertRedirect(route('teacher.course.editor', $course));
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('courses', ['id' => $course->id, ...collect($data)->except('teacher_id')->all()]);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $owner->id, 'role' => 'owner']);
    $this->get(route('teacher.course.editor', $course))->assertInertia(fn (Assert $page) => $page
        ->where('course.title', 'Updated course')->where('course.is_published', false)
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('overview.slug', 'updated-course')
            ->where('overview.description', 'Saved description')
            ->where('overview.thumbnail', 'https://example.com/cover.jpg')
            ->where('overview.intro_video_url', 'https://example.com/intro.mp4')
            ->where('overview.permissions.update_information', true)
            ->where('overview.permissions.publish', true)
            ->where('overview.permissions.manage_teachers', true)
        )
    );
});

test('saving from the editor returns fresh overview data in the partial Inertia response', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $initialResponse = $this->actingAs($owner->user)->get(route('teacher.course.editor', $course));
    $headers = [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $initialResponse->viewData('page')['version'],
        'X-Inertia-Partial-Component' => 'teacher/course/editor',
        'X-Inertia-Partial-Data' => 'course,overview',
    ];

    $response = $this->withHeaders($headers)->followingRedirects()->patch(route('teacher.course.editor.information', $course), [
        'title' => 'Saved through editor', 'slug' => 'saved-through-editor', 'description' => 'Fresh overview',
    ]);

    $response->assertJsonPath('component', 'teacher/course/editor')
        ->assertJsonPath('props.course.title', 'Saved through editor')
        ->assertJsonPath('props.overview.slug', 'saved-through-editor')
        ->assertJsonPath('props.overview.description', 'Fresh overview');
});

test('validation errors return to the editor in the information form error bag', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $initialResponse = $this->actingAs($owner->user)->get(route('teacher.course.editor', $course));
    $headers = [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => $initialResponse->viewData('page')['version'],
        'X-Inertia-Partial-Component' => 'teacher/course/editor',
        'X-Inertia-Partial-Data' => 'course,overview',
        'X-Inertia-Error-Bag' => 'courseInformation',
    ];

    $response = $this->from(route('teacher.course.editor', $course))->withHeaders($headers)->followingRedirects()
        ->patch(route('teacher.course.editor.information', $course), ['title' => $course->title, 'slug' => 'invalid/slug']);

    $response->assertJsonPath('component', 'teacher/course/editor')
        ->assertJsonPath('props.errors.courseInformation.slug', 'شناسه متنی فقط می‌تواند شامل حروف، عدد، خط تیره و زیرخط باشد.')
        ->assertJsonMissingPath('props.errors.courseTeachers');
    $this->assertDatabaseHas('courses', ['id' => $course->id, 'slug' => $course->slug]);
});

test('an instructor cannot save course information even without sending publication', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Instructor]);

    $response = $this->actingAs($teacher->user)->patch(route('teacher.course.editor.information', $course), ['title' => 'Disallowed title', 'slug' => $course->slug]);

    $response->assertForbidden();
    $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => $course->title]);
});

test('an editor can keep the existing slug and media paths and clear optional fields', function () {
    $course = Course::factory()->create(['thumbnail' => 'course/old-cover.jpg', 'description' => 'Old description', 'is_published' => true]);
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Editor]);

    $response = $this->actingAs($teacher->user)->patch(route('teacher.course.editor.information', $course), [
        'title' => 'Editor update', 'slug' => $course->slug, 'description' => '', 'thumbnail' => $course->thumbnail, 'intro_video_url' => '',
    ]);

    $response->assertRedirect(route('teacher.course.editor', $course));
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => 'Editor update', 'slug' => $course->slug, 'description' => null, 'thumbnail' => 'course/old-cover.jpg', 'intro_video_url' => null, 'is_published' => true]);
});

test('an editor cannot change publication through either course update endpoint', function () {
    $course = Course::factory()->create(['is_published' => false]);
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Editor]);
    $this->actingAs($teacher->user);

    $editorResponse = $this->patch(route('teacher.course.editor.information', $course), ['title' => 'Unauthorized change', 'slug' => $course->slug, 'is_published' => true]);
    $legacyResponse = $this->put(route('teacher.course.update', $course), ['title' => 'Unauthorized change', 'slug' => $course->slug, 'is_published' => true]);

    $editorResponse->assertForbidden();
    $legacyResponse->assertForbidden();
    $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => $course->title, 'is_published' => false]);
});

test('invalid information is rejected with field errors and no saved changes', function () {
    $course = Course::factory()->create();
    $takenCourse = Course::factory()->create(['slug' => 'taken-slug']);
    $takenCourse->delete();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->patch(route('teacher.course.editor.information', $course), [
        'title' => '', 'slug' => 'taken-slug', 'description' => str_repeat('a', 4097), 'thumbnail' => 'javascript:alert(1)', 'intro_video_url' => 'not-a-url', 'is_published' => 'invalid',
    ]);

    $response->assertSessionHasErrors(['title', 'slug', 'description', 'thumbnail', 'intro_video_url', 'is_published']);
    $response->assertSessionHasErrors(['slug' => 'این شناسه متنی قبلاً استفاده شده است.']);
    $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => $course->title, 'slug' => $course->slug, 'description' => $course->description, 'thumbnail' => null]);
});

test('a slug containing route separators is rejected', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($owner->user)->patch(route('teacher.course.editor.information', $course), ['title' => $course->title, 'slug' => '../another-course']);

    $response->assertSessionHasErrors(['slug' => 'شناسه متنی فقط می‌تواند شامل حروف، عدد، خط تیره و زیرخط باشد.']);
    $this->assertDatabaseHas('courses', ['id' => $course->id, 'slug' => $course->slug]);
});

test('an unrelated teacher cannot modify another course through either update endpoint', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $this->actingAs($teacher->user);

    $editorResponse = $this->patch(route('teacher.course.editor.information', $course), ['title' => 'Changed', 'slug' => $course->slug]);
    $legacyResponse = $this->put(route('teacher.course.update', $course), ['title' => 'Changed', 'slug' => $course->slug]);

    $editorResponse->assertNotFound();
    $legacyResponse->assertNotFound();
    $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => $course->title]);
});

test('a member with a revoked teacher role cannot use editor write permissions', function () {
    $course = Course::factory()->create();
    $owner = Teacher::factory()->create();
    $course->teachers()->attach($owner, ['role' => TeacherRole::Owner]);
    $owner->user->removeRole('teacher');

    $gate = Gate::forUser($owner->user);

    expect($gate->allows('updateEditorInformation', $course))->toBeFalse();
    expect($gate->allows('publishEditorCourse', $course))->toBeFalse();
    expect($gate->allows('manageEditorTeachers', $course))->toBeFalse();
});

test('teacher course creation assigns the real teacher as owner and saves the publication flag', function () {
    User::factory()->count(3)->create();
    $teacher = Teacher::factory()->create();

    $response = $this->actingAs($teacher->user)->post(route('teacher.course.store'), ['title' => 'New course', 'slug' => 'new-course', 'is_published' => false]);

    $response->assertRedirect(route('teacher.course.index'));
    $response->assertSessionHasNoErrors();
    $course = Course::where('slug', 'new-course')->sole();
    $this->assertDatabaseHas('courses', ['id' => $course->id, 'is_published' => false]);
    $this->assertDatabaseHas('course_teacher', ['course_id' => $course->id, 'teacher_id' => $teacher->id, 'role' => 'owner']);
    expect($course->teachers->sole()->pivot->created_at)->not->toBeNull();
    expect($teacher->courses->sole()->pivot->role)->toBe('owner');
});
