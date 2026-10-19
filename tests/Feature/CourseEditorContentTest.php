<?php

use App\Enums\TeacherRole;
use App\Models\Content;
use App\Models\Course;
use App\Models\FileContent;
use App\Models\ImageContent;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\RemindContent;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use App\Models\TextContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/** @return array{Course, Teacher, Space, Section, Lesson, Plan} */
function contentEditorData(TeacherRole $role = TeacherRole::Owner): array
{
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => $role]);
    $space = Space::factory()->for($course)->create();
    $section = Section::factory()->for($course)->create(['order' => 7]);
    $lesson = Lesson::factory()->for($section)->create(['order' => 5]);
    $plan = Plan::factory()->for($space)->create(['order' => 9]);

    return [$course, $teacher, $space, $section, $lesson, $plan];
}

function contentTestImage(): UploadedFile
{
    return UploadedFile::fake()->createWithContent('image.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jk1sAAAAASUVORK5CYII='));
}
beforeEach(function () {
    Storage::fake('public');
    Storage::fake('local');
});

test('owner creates text content with access and prerequisite', function () {
    [$course, $teacher, $space, , $lesson, $plan] = contentEditorData();
    $quizId = DB::table('quizzes')->insertGetId(['time' => '00:10:00', 'score' => 20]);
    $space->update(['quiz_id' => $quizId]);
    $this->actingAs($teacher->user);

    $this->post(route('teacher.lesson.editor.contents.store', $lesson), [
        'type' => 'text', 'body' => 'Hello', 'description' => 'Intro',
        'accesses' => [['plan_id' => $plan->id, 'requirements' => [['space_id' => $space->id, 'score' => 10]]]],
    ])->assertRedirect(route('teacher.course.editor', $course))->assertSessionHas('editor_created.kind', 'content');

    $content = Content::query()->where('lesson_id', $lesson->id)->firstOrFail();
    expect($content->contentable)->toBeInstanceOf(TextContent::class)->and($content->order)->toBe(1);
    $this->assertDatabaseHas('accesses', ['content_id' => $content->id, 'plan_id' => $plan->id]);
    $this->assertDatabaseHas('requirements', ['space_id' => $space->id, 'score' => 10]);
});

test('editor uploads image to public and file to private disk', function () {
    [, $teacher, , , $lesson] = contentEditorData(TeacherRole::Editor);
    $this->actingAs($teacher->user);

    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'image', 'image_file' => contentTestImage()])->assertSessionHasNoErrors();
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'file', 'content_file' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')])->assertSessionHasNoErrors();

    Storage::disk('public')->assertExists(ImageContent::query()->firstOrFail()->path);
    Storage::disk('local')->assertExists(FileContent::query()->firstOrFail()->path);
});

test('type change keeps base content and removes old file', function () {
    [, $teacher, , , $lesson] = contentEditorData();
    $this->actingAs($teacher->user);
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'image', 'image_file' => contentTestImage()]);
    $content = Content::query()->firstOrFail();
    $oldPath = $content->contentable->path;

    $this->patch(route('teacher.content.editor.update', $content), ['type' => 'text', 'body' => 'Now text'])->assertSessionHasNoErrors();

    expect($content->fresh()->contentable)->toBeInstanceOf(TextContent::class);
    Storage::disk('public')->assertMissing($oldPath);
    $this->assertDatabaseCount('image_contents', 0);
});

test('invalid input and foreign ids are rejected', function () {
    [, $teacher, , , $lesson] = contentEditorData();
    [, , , , , $foreignPlan] = contentEditorData();
    $this->actingAs($teacher->user);

    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'video', 'name' => 'v', 'url' => 'not a url'])->assertSessionHasErrors('url');
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'text', 'body' => 'x', 'accesses' => [['plan_id' => $foreignPlan->id]]])->assertSessionHasErrors('accesses.0.plan_id');
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'file'])->assertSessionHasErrors('content_file');
    expect(Content::query()->count())->toBe(0);
});

test('remind cannot reference itself and roles are enforced', function () {
    [, $teacher, , , $lesson] = contentEditorData();
    $this->actingAs($teacher->user);
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'text', 'body' => 'x']);
    $target = Content::query()->firstOrFail();
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'remind', 'content_id' => $target->id])->assertSessionHasNoErrors();
    $remind = Content::query()->where('contentable_type', RemindContent::class)->firstOrFail();

    $this->patch(route('teacher.content.editor.update', $remind), ['type' => 'remind', 'content_id' => $remind->id])->assertSessionHasErrors('content_id');
    $this->delete(route('teacher.content.editor.destroy', $target))->assertSessionHasErrors('content');
    $this->assertModelExists($target);

    [, $assistant, , , $otherLesson] = contentEditorData(TeacherRole::Assistant);
    $this->actingAs($assistant->user)->post(route('teacher.lesson.editor.contents.store', $otherLesson), ['type' => 'text', 'body' => 'x'])->assertForbidden();
    $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.contents.store', $otherLesson), ['type' => 'text', 'body' => 'x'])->assertNotFound();
});

test('delete cleans accesses record and file', function () {
    [$course, $teacher, , , $lesson, $plan] = contentEditorData();
    $this->actingAs($teacher->user);
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'image', 'image_file' => contentTestImage(), 'accesses' => [['plan_id' => $plan->id]]]);
    $content = Content::query()->firstOrFail();
    $path = $content->contentable->path;

    $this->delete(route('teacher.content.editor.destroy', $content))->assertRedirect(route('teacher.course.editor', $course));
    $this->assertModelMissing($content);
    $this->assertDatabaseCount('accesses', 0);
    $this->assertDatabaseCount('image_contents', 0);
    Storage::disk('public')->assertMissing($path);
});

test('content values for video and table survive reopening the editor', function (array $payload, string $field, mixed $expected) {
    [$course, $teacher, , , $lesson] = contentEditorData();
    $this->actingAs($teacher->user);

    $this->post(route('teacher.lesson.editor.contents.store', $lesson), $payload)->assertSessionHasNoErrors();

    $this->get(route('teacher.course.editor', $course))->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $overview) => $overview
            ->where('overview.sections.0.lessons.0.contents.0.type', $payload['type'])
            ->where("overview.sections.0.lessons.0.contents.0.{$field}", $expected)));
})->with([
    'video' => [['type' => 'video', 'name' => 'Video', 'url' => 'https://example.com/video.mp4'], 'url', 'https://example.com/video.mp4'],
    'table' => [['type' => 'table', 'table' => [['one', 'two'], ['three', 'four']]], 'table', [['one', 'two'], ['three', 'four']]],
]);

test('owner edits existing prerequisites and can use the same quiz space for separate plans', function () {
    [, $teacher, $space, , $lesson, $plan] = contentEditorData();
    $space->update(['quiz_id' => DB::table('quizzes')->insertGetId(['time' => '00:10:00', 'score' => 20])]);
    $secondPlan = Plan::factory()->for($space)->create();
    $this->actingAs($teacher->user);
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), [
        'type' => 'text', 'body' => 'Original',
        'accesses' => [['plan_id' => $plan->id, 'requirements' => [['space_id' => $space->id, 'score' => 5]]]],
    ])->assertSessionHasNoErrors();
    $content = $lesson->contents()->firstOrFail();

    $this->patch(route('teacher.content.editor.update', $content), [
        'type' => 'text', 'body' => 'Changed', 'accesses' => [
            ['plan_id' => $plan->id, 'requirements' => [['space_id' => $space->id, 'score' => 10]]],
            ['plan_id' => $secondPlan->id, 'requirements' => [['space_id' => $space->id, 'score' => 15]]],
        ],
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseCount('requirements', 2);
    $this->assertDatabaseHas('requirements', ['access_id' => $content->accesses()->where('plan_id', $plan->id)->value('id'), 'space_id' => $space->id, 'score' => 10]);
    $this->assertDatabaseHas('requirements', ['access_id' => $content->accesses()->where('plan_id', $secondPlan->id)->value('id'), 'space_id' => $space->id, 'score' => 15]);
});

test('multipart update removes the final access and its prerequisites', function () {
    [, $teacher, $space, , $lesson, $plan] = contentEditorData();
    $space->update(['quiz_id' => DB::table('quizzes')->insertGetId(['time' => '00:10:00', 'score' => 20])]);
    $this->actingAs($teacher->user);
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), [
        'type' => 'text', 'body' => 'Original',
        'accesses' => [['plan_id' => $plan->id, 'requirements' => [['space_id' => $space->id, 'score' => 5]]]],
    ]);
    $content = $lesson->contents()->firstOrFail();

    $this->post(route('teacher.content.editor.update', $content), [
        '_method' => 'patch', 'type' => 'image', 'image_file' => contentTestImage(), 'update_accesses' => '1',
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseCount('accesses', 0);
    $this->assertDatabaseCount('requirements', 0);
    Storage::disk('public')->assertExists($content->fresh()->contentable->path);
});

test('instructor changes content while existing commerce data stays intact', function () {
    [, $owner, , , $lesson, $plan] = contentEditorData();
    $instructor = Teacher::factory()->create();
    $lesson->section->course->teachers()->attach($instructor, ['role' => TeacherRole::Instructor]);
    $this->actingAs($owner->user)->post(route('teacher.lesson.editor.contents.store', $lesson), [
        'type' => 'text', 'body' => 'Original', 'accesses' => [['plan_id' => $plan->id]],
    ]);
    $content = $lesson->contents()->firstOrFail();

    $this->actingAs($instructor->user)->patch(route('teacher.content.editor.update', $content), ['type' => 'text', 'body' => 'Updated'])->assertSessionHasNoErrors();

    expect($content->fresh()->contentable->body)->toBe('Updated');
    $this->assertDatabaseHas('accesses', ['content_id' => $content->id, 'plan_id' => $plan->id]);
    $this->patch(route('teacher.content.editor.update', $content), ['type' => 'text', 'body' => 'Forged', 'update_accesses' => true])->assertForbidden();
    $this->delete(route('teacher.content.editor.destroy', $content))->assertForbidden();
    expect($content->fresh()->contentable->body)->toBe('Updated');
});

test('cross course and guest writes cannot edit or delete content', function () {
    [, $teacher] = contentEditorData();
    [, , , , $foreignLesson] = contentEditorData();
    $record = TextContent::query()->create(['body' => 'Private']);
    $content = $foreignLesson->contents()->create(['description' => '', 'order' => 1, 'contentable_type' => TextContent::class, 'contentable_id' => $record->id]);

    $this->patch(route('teacher.content.editor.update', $content), ['type' => 'text', 'body' => 'Forged'])->assertRedirect(route('login'));
    $this->delete(route('teacher.content.editor.destroy', $content))->assertRedirect(route('login'));
    $this->actingAs($teacher->user)->patch(route('teacher.content.editor.update', $content), ['type' => 'text', 'body' => 'Forged'])->assertNotFound();
    $this->delete(route('teacher.content.editor.destroy', $content))->assertNotFound();

    $this->assertModelExists($content);
    expect($record->fresh()->body)->toBe('Private');
});

test('remind rejects a foreign target and an indirect cycle without changing existing data', function () {
    [, $teacher, , , $lesson] = contentEditorData();
    [, , , , $foreignLesson] = contentEditorData();
    $foreign = Content::factory()->for($foreignLesson)->text()->create();
    $this->actingAs($teacher->user);
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'text', 'body' => 'Root']);
    $root = $lesson->contents()->firstOrFail();
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'remind', 'content_id' => $root->id]);
    $reference = $lesson->contents()->orderByDesc('id')->firstOrFail();

    $this->patch(route('teacher.content.editor.update', $root), ['type' => 'remind', 'content_id' => $reference->id])->assertSessionHasErrors('content_id');
    $this->patch(route('teacher.content.editor.update', $reference), ['type' => 'remind', 'content_id' => $foreign->id])->assertSessionHasErrors('content_id');

    expect($root->fresh()->contentable)->toBeInstanceOf(TextContent::class);
    expect($reference->fresh()->contentable->content_id)->toBe($root->id);
});

test('private file download requires membership and never exposes a storage path', function () {
    [$course, $teacher, , , $lesson] = contentEditorData();
    $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'file', 'content_file' => UploadedFile::fake()->create('guide.pdf', 10, 'application/pdf')]);
    $content = $lesson->contents()->firstOrFail();

    $this->get(route('teacher.content.editor.download', $content))->assertDownload('guide.pdf');
    $this->get(route('teacher.course.editor', $course))->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $overview) => $overview
        ->where('overview.sections.0.lessons.0.contents.0.url', route('teacher.content.editor.download', $content))));
    $other = Teacher::factory()->create();
    $this->actingAs($other->user)->get(route('teacher.content.editor.download', $content))->assertNotFound();
    Storage::disk('local')->assertExists($content->contentable->path);
});

test('invalid replacement preserves the old file and content', function () {
    [, $teacher, , , $lesson] = contentEditorData();
    $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'image', 'image_file' => contentTestImage()]);
    $content = $lesson->contents()->firstOrFail();
    $path = $content->contentable->path;

    $this->patch(route('teacher.content.editor.update', $content), ['type' => 'image', 'image_file' => UploadedFile::fake()->create('unsafe.svg', 10, 'image/svg+xml')])->assertSessionHasErrors('image_file');

    expect($content->fresh()->contentable->path)->toBe($path);
    Storage::disk('public')->assertExists($path);
    expect(Storage::disk('public')->allFiles())->toHaveCount(1);
});

test('duplicate prerequisites within one access are rejected', function () {
    [, $teacher, $space, , $lesson, $plan] = contentEditorData();
    $space->update(['quiz_id' => DB::table('quizzes')->insertGetId(['time' => '00:10:00', 'score' => 20])]);

    $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.contents.store', $lesson), [
        'type' => 'text', 'body' => 'Root', 'accesses' => [['plan_id' => $plan->id, 'requirements' => [
            ['space_id' => $space->id, 'score' => 1], ['space_id' => $space->id, 'score' => 2],
        ]]],
    ])->assertSessionHasErrors('accesses.0.requirements');

    $this->assertDatabaseCount('contents', 0);
    $this->assertDatabaseCount('requirements', 0);
});

test('failed persistence rolls back the type record and cleans the newly uploaded file', function () {
    [, $teacher, , , $lesson] = contentEditorData();
    Exceptions::fake();
    Event::listen('eloquent.creating: '.Content::class, function (): void {
        throw new RuntimeException('Storage transaction failed');
    });

    try {
        $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.contents.store', $lesson), [
            'type' => 'image', 'image_file' => contentTestImage(),
        ])->assertInternalServerError();
    } finally {
        Event::forget('eloquent.creating: '.Content::class);
    }

    Exceptions::assertReported(RuntimeException::class);
    $this->assertDatabaseCount('contents', 0);
    $this->assertDatabaseCount('image_contents', 0);
    expect(Storage::disk('public')->allFiles())->toBe([]);
});

test('media name can be edited without replacing the existing file', function () {
    [, $teacher, , , $lesson] = contentEditorData();
    $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'image', 'image_file' => contentTestImage()]);
    $content = $lesson->contents()->firstOrFail();
    $path = $content->contentable->path;

    $this->patch(route('teacher.content.editor.update', $content), ['type' => 'image', 'name' => 'Edited cover'])->assertSessionHasNoErrors();

    expect($content->fresh()->contentable->name)->toBe('Edited cover');
    expect($content->fresh()->contentable->path)->toBe($path);
    Storage::disk('public')->assertExists($path);
});
