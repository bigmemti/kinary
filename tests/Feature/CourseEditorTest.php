<?php

use App\Enums\TeacherRole;
use App\Models\Content;
use App\Models\Course;
use App\Models\FileContent;
use App\Models\ImageContent;
use App\Models\Lesson;
use App\Models\RemindContent;
use App\Models\Section;
use App\Models\TableContent;
use App\Models\Teacher;
use App\Models\TextContent;
use App\Models\User;
use App\Models\VideoContent;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;

test('course members in every teaching role can view the editor', function (TeacherRole $role) {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => $role]);

    $allowed = Gate::forUser($teacher->user)->allows('viewEditor', $course);

    expect($allowed)->toBeTrue();
})->with([
    'owner' => TeacherRole::Owner,
    'instructor' => TeacherRole::Instructor,
    'assistant' => TeacherRole::Assistant,
    'reviewer' => TeacherRole::Reviewer,
    'editor' => TeacherRole::Editor,
]);

test('the editor policy denies an unrelated teacher', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();

    $authorization = Gate::forUser($teacher->user)->inspect('viewEditor', $course);

    expect($authorization->denied())->toBeTrue();
    expect($authorization->status())->toBe(404);
});

test('the editor policy denies a member whose global teacher role was revoked', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $teacher->user->removeRole('teacher');

    $allowed = Gate::forUser($teacher->user)->allows('viewEditor', $course);

    expect($allowed)->toBeFalse();
});

test('the editor opens the assigned course and defers its overview', function () {
    $course = Course::factory()->create(['title' => 'دوره آزمایشی', 'is_published' => false]);
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);

    $response = $this->actingAs($teacher->user)->get(route('teacher.course.editor', $course));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('teacher/course/editor')
        ->where('course.id', $course->id)
        ->where('course.title', 'دوره آزمایشی')
        ->where('course.is_published', false)
        ->missing('overview')
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('overview.sections_count', 0)
            ->where('overview.spaces_count', 0)
            ->where('overview.sections', [])
            ->has('overview.teachers', 1)
            ->where('overview.teachers.0.id', $teacher->id)
            ->where('overview.teachers.0.name', $teacher->user->name)
            ->where('overview.teachers.0.role', 'owner')
            ->missing('overview.teachers.0.email')
            ->missing('overview.teachers.0.user')
        )
    );
});

test('the deferred overview returns saved course details and counts its sections', function () {
    $course = Course::factory()->create(['description' => 'شرح دوره', 'thumbnail' => null]);
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Editor]);
    Section::factory()->for($course)->count(2)->sequence(['order' => 1], ['order' => 2])->create();

    $response = $this->actingAs($teacher->user)->get(route('teacher.course.editor', $course));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('teacher/course/editor')
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('overview.description', 'شرح دوره')
            ->where('overview.thumbnail', null)
            ->where('overview.sections_count', 2)
            ->where('overview.teachers.0.role', 'editor')
        )
    );
});

test('the editor returns only its course hierarchy ordered by position and identifier', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Editor]);
    $sections = Section::factory()->for($course)->count(3)
        ->sequence(['order' => 20], ['order' => 10], ['order' => 10])->create();
    $lessons = Lesson::factory()->for($sections[1])->count(3)
        ->sequence(['order' => 20], ['order' => 10], ['order' => 10])->create();
    $contents = Content::factory()->for($lessons[1])->count(3)
        ->state(['description' => 'Saved description', 'contentable_type' => TextContent::class, 'contentable_id' => 1])
        ->sequence(['order' => 20], ['order' => 10], ['order' => 10])
        ->afterMaking(function (Content $content): void {
            unset($content->body);
        })->create();
    $otherSection = Section::factory()->for(Course::factory())->create(['order' => 1]);
    $otherLesson = Lesson::factory()->for($otherSection)->create(['order' => 1]);
    Content::factory()->for($otherLesson)
        ->state(['description' => 'Other course private content', 'order' => 1, 'contentable_type' => TextContent::class, 'contentable_id' => 2])
        ->afterMaking(function (Content $content): void {
            unset($content->body);
        })->create();

    $response = $this->actingAs($teacher->user)->get(route('teacher.course.editor', $course));

    $response->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->has('overview.sections', 3)
            ->where('overview.sections.0.id', $sections[1]->id)
            ->where('overview.sections.1.id', $sections[2]->id)
            ->where('overview.sections.2.id', $sections[0]->id)
            ->where('overview.sections.0.name', $sections[1]->name)
            ->where('overview.sections.0.order', 10)
            ->has('overview.sections.0.lessons', 3)
            ->where('overview.sections.0.lessons.0.id', $lessons[1]->id)
            ->where('overview.sections.0.lessons.1.id', $lessons[2]->id)
            ->where('overview.sections.0.lessons.2.id', $lessons[0]->id)
            ->where('overview.sections.0.lessons.0.name', $lessons[1]->name)
            ->where('overview.sections.0.lessons.0.order', 10)
            ->has('overview.sections.0.lessons.0.contents', 3)
            ->where('overview.sections.0.lessons.0.contents.0.id', $contents[1]->id)
            ->where('overview.sections.0.lessons.0.contents.1.id', $contents[2]->id)
            ->where('overview.sections.0.lessons.0.contents.2.id', $contents[0]->id)
            ->where('overview.sections.0.lessons.0.contents.0.description', 'Saved description')
            ->where('overview.sections.0.lessons.0.contents.0.order', 10)
            ->where('overview.sections.0.lessons.0.contents.0.type', 'text')
            ->missing('overview.sections.0.lessons.0.contents.0.contentable_type')
            ->missing('overview.sections.0.lessons.0.contents.0.contentable_id')
            ->where('overview.sections.0.lessons.1.contents', [])
            ->where('overview.sections.1.lessons', [])
        )
    );
});

test('the editor presents supported content types and safely labels an unfamiliar type', function (string $model, string $type) {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $section = Section::factory()->for($course)->create(['order' => 1]);
    $lesson = Lesson::factory()->for($section)->create(['order' => 1]);
    Content::factory()->for($lesson)
        ->state(['description' => '', 'order' => 1, 'contentable_type' => $model, 'contentable_id' => 1])
        ->afterMaking(function (Content $content): void {
            unset($content->body);
        })->create();

    $response = $this->actingAs($teacher->user)->get(route('teacher.course.editor', $course));

    $response->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('overview.sections.0.lessons.0.contents.0.type', $type)
            ->where('overview.sections.0.lessons.0.contents.0.description', '')
        )
    );
})->with([
    'text' => [TextContent::class, 'text'],
    'image' => [ImageContent::class, 'image'],
    'video' => [VideoContent::class, 'video'],
    'file' => [FileContent::class, 'file'],
    'table' => [TableContent::class, 'table'],
    'remind' => [RemindContent::class, 'remind'],
    'unknown' => ['LegacyContent', 'unknown'],
]);

test('another course is hidden on both initial and deferred editor requests', function (array $headers) {
    $ownedCourse = Course::factory()->create();
    $otherCourse = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $ownedCourse->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $initialResponse = $this->actingAs($teacher->user)->get(route('teacher.course.editor', $ownedCourse));
    $headers['X-Inertia-Version'] = $initialResponse->viewData('page')['version'];

    $response = $this->actingAs($teacher->user)->withHeaders($headers)
        ->get(route('teacher.course.editor', $otherCourse));

    $response->assertNotFound();
})->with([
    'initial page' => [[]],
    'deferred overview' => [[
        'X-Inertia' => 'true',
        'X-Inertia-Partial-Component' => 'teacher/course/editor',
        'X-Inertia-Partial-Data' => 'overview',
    ]],
]);

test('guests are redirected to sign in before opening the editor', function () {
    $course = Course::factory()->create();

    $response = $this->get(route('teacher.course.editor', $course));

    $response->assertRedirect(route('login'));
});

test('users without the teacher role cannot open the editor', function () {
    $course = Course::factory()->create();
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('teacher.course.editor', $course));

    $response->assertForbidden();
});

test('a deleted course cannot be opened in the editor', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $course->delete();

    $response = $this->actingAs($teacher->user)->get(route('teacher.course.editor', $course));

    $response->assertNotFound();
});
