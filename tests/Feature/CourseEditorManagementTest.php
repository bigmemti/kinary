<?php

use App\Enums\TeacherRole;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use App\Models\TextContent;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/** @return array{Course, Teacher, Space, Section, Lesson, Plan} */
function editorManagementData(TeacherRole $role = TeacherRole::Owner): array
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

function editorTestImage(string $name = 'image.png'): UploadedFile
{
    return UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jk1sAAAAASUVORK5CYII='));
}

test('structure and commerce permissions match each course role', function (TeacherRole $role, bool $commerce, bool $structure, bool $delete) {
    [$course, $teacher] = editorManagementData($role);
    $gate = Gate::forUser($teacher->user);

    expect($gate->allows('manageEditorCommerce', $course))->toBe($commerce);
    expect($gate->allows('updateEditorStructure', $course))->toBe($structure);
    expect($gate->allows('deleteEditorStructure', $course))->toBe($delete);
})->with([
    'owner' => [TeacherRole::Owner, true, true, true],
    'editor' => [TeacherRole::Editor, false, true, true],
    'instructor' => [TeacherRole::Instructor, false, true, false],
    'assistant' => [TeacherRole::Assistant, false, false, false],
    'reviewer' => [TeacherRole::Reviewer, false, false, false],
]);

test('owner creates edits and deletes an unused space with its quiz setting', function () {
    [$course, $teacher] = editorManagementData();
    $quizId = DB::table('quizzes')->insertGetId(['time' => '00:10:00', 'score' => 20]);
    $this->actingAs($teacher->user);

    $this->post(route('teacher.course.space.store', $course), ['name' => 'New space', 'quiz_id' => $quizId, 'course_id' => 999])->assertRedirect(route('teacher.course.editor', $course));
    $space = $course->spaces()->where('name', 'New space')->firstOrFail();
    $this->assertDatabaseHas('spaces', ['id' => $space->id, 'course_id' => $course->id, 'quiz_id' => $quizId]);
    $this->put(route('teacher.space.update', $space), ['name' => 'Edited space', 'quiz_id' => null])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('spaces', ['id' => $space->id, 'name' => 'Edited space', 'quiz_id' => null]);
    $this->delete(route('teacher.space.destroy', $space))->assertRedirect(route('teacher.course.editor', $course));
    $this->assertModelMissing($space);
});

test('owner manages plans in their actual space with server assigned creation order', function () {
    [$course, $teacher, $space] = editorManagementData();
    $this->actingAs($teacher->user);

    $this->post(route('teacher.space.plan.store', $space), ['name' => 'New plan', 'price' => 0, 'order' => 1, 'space_id' => 999])->assertRedirect(route('teacher.course.editor', $course));
    $plan = $space->plans()->where('name', 'New plan')->firstOrFail();
    $this->assertDatabaseHas('plans', ['id' => $plan->id, 'space_id' => $space->id, 'order' => 10, 'price' => 0]);
    $this->put(route('teacher.plan.update', $plan), ['name' => 'Edited plan', 'price' => 25000, 'order' => 2])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('plans', ['id' => $plan->id, 'name' => 'Edited plan', 'price' => 25000, 'order' => 2]);
    $this->delete(route('teacher.plan.destroy', $plan))->assertRedirect(route('teacher.course.editor', $course));
    $this->assertModelMissing($plan);
});

test('structure creation appends after maximum order and returns the exact new selection', function () {
    [$course, $teacher, , $section] = editorManagementData(TeacherRole::Instructor);
    $this->actingAs($teacher->user);

    $this->post(route('teacher.course.section.store', $course), ['name' => 'New section'])->assertRedirect(route('teacher.course.editor', $course));
    $createdSection = $course->sections()->where('name', 'New section')->firstOrFail();
    $this->assertDatabaseHas('sections', ['id' => $createdSection->id, 'order' => 8]);
    $this->get(route('teacher.course.editor', $course))->assertInertia(fn (Assert $page) => $page->where('createdItem', ['kind' => 'section', 'id' => $createdSection->id, 'parent_id' => $course->id]));
    $this->post(route('teacher.section.lesson.store', $section), ['name' => 'New lesson', 'section_id' => 999])->assertSessionHas('editor_created.kind', 'lesson');
    $createdLesson = $section->lessons()->where('name', 'New lesson')->firstOrFail();
    $this->assertDatabaseHas('lessons', ['id' => $createdLesson->id, 'order' => 6, 'section_id' => $section->id]);
    $this->put(route('teacher.section.update', $createdSection), ['name' => 'Edited section', 'order' => 3])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('sections', ['id' => $createdSection->id, 'name' => 'Edited section', 'order' => 3]);
});

test('lesson saves uploaded images and independent prices and returns them on reopening', function () {
    Storage::fake('public');
    [$course, $teacher, , , $lesson, $plan] = editorManagementData();

    $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.update', $lesson), [
        '_method' => 'patch', 'name' => 'Edited lesson', 'order' => 2,
        'thumbnail_file' => editorTestImage(), 'image_files' => [editorTestImage('gallery.png')],
        'pricings' => [['plan_id' => $plan->id, 'price' => 0]],
    ])->assertRedirect(route('teacher.course.editor', $course))->assertSessionHasNoErrors();

    $lesson->refresh();
    $this->assertDatabaseHas('lessons', ['id' => $lesson->id, 'name' => 'Edited lesson', 'order' => 2]);
    $this->assertDatabaseHas('pricings', ['lesson_id' => $lesson->id, 'plan_id' => $plan->id, 'price' => 0]);
    Storage::disk('public')->assertExists([$lesson->thumbnail, ...$lesson->images]);
    $this->get(route('teacher.course.editor', $course))->assertInertia(fn (Assert $page) => $page->loadDeferredProps(fn (Assert $reload) => $reload
        ->where('overview.sections.0.lessons.0.thumbnail', $lesson->thumbnail)
        ->where('overview.sections.0.lessons.0.images.0.path', $lesson->images[0])
        ->where('overview.sections.0.lessons.0.pricings.0.price', 0)
        ->where('overview.spaces.0.plans.0.price', $plan->price)
    ));
});

test('owner can remove the last price using multipart marker and replace images', function () {
    Storage::fake('public');
    [$course, $teacher, , , $lesson, $plan] = editorManagementData();
    Storage::disk('public')->put('old.png', 'old');
    Storage::disk('public')->put('gallery.png', 'old');
    $lesson->update(['thumbnail' => 'old.png', 'images' => ['gallery.png']]);
    $lesson->pricings()->create(['plan_id' => $plan->id, 'price' => 150]);

    $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.update', $lesson), [
        '_method' => 'patch', 'name' => $lesson->name, 'order' => 5, 'update_pricings' => '1',
        'thumbnail_file' => editorTestImage(), 'remove_images' => ['gallery.png'],
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('pricings', ['lesson_id' => $lesson->id]);
    expect($lesson->fresh()->images)->toBe([]);
    Storage::disk('public')->assertMissing(['old.png', 'gallery.png']);
    Storage::disk('public')->assertExists($lesson->fresh()->thumbnail);
});

test('instructor edits lesson details but cannot send prices', function () {
    [$course, $teacher, , , $lesson, $plan] = editorManagementData(TeacherRole::Instructor);
    $lesson->pricings()->create(['plan_id' => $plan->id, 'price' => 25]);
    $this->actingAs($teacher->user);

    $this->patch(route('teacher.lesson.editor.update', $lesson), ['name' => 'Instructor edit', 'order' => 2])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('pricings', ['lesson_id' => $lesson->id, 'price' => 25]);
    $this->patch(route('teacher.lesson.editor.update', $lesson), ['name' => 'Forbidden edit', 'order' => 3, 'pricings' => []])->assertForbidden();
    $this->assertDatabaseHas('lessons', ['id' => $lesson->id, 'name' => 'Instructor edit', 'order' => 2]);
});

test('invalid lesson prices or uploads preserve previous data and files', function (string $failure) {
    Storage::fake('public');
    [$course, $teacher, , , $lesson, $plan] = editorManagementData();
    Storage::disk('public')->put('old.png', 'keep');
    $lesson->update(['thumbnail' => 'old.png']);
    $lesson->pricings()->create(['plan_id' => $plan->id, 'price' => 50]);
    $data = match ($failure) {
        'foreign plan' => ['pricings' => [['plan_id' => Plan::factory()->create()->id, 'price' => 20]]],
        'negative price' => ['pricings' => [['plan_id' => $plan->id, 'price' => -1]]],
        'duplicate plan' => ['pricings' => [['plan_id' => $plan->id, 'price' => 1], ['plan_id' => $plan->id, 'price' => 2]]],
        'non image' => ['thumbnail_file' => UploadedFile::fake()->create('bad.txt', 1, 'text/plain')],
        'foreign image' => ['remove_images' => ['another-lesson.png']],
        'invalid order' => ['order' => 32768],
    };

    $this->actingAs($teacher->user)->patch(route('teacher.lesson.editor.update', $lesson), [...['name' => 'Should not save', 'order' => 1, 'remove_thumbnail' => true], ...$data])->assertSessionHasErrors();

    $this->assertDatabaseHas('lessons', ['id' => $lesson->id, 'name' => $lesson->name, 'thumbnail' => 'old.png']);
    $this->assertDatabaseHas('pricings', ['lesson_id' => $lesson->id, 'price' => 50]);
    Storage::disk('public')->assertExists('old.png');
})->with(['foreign plan', 'negative price', 'duplicate plan', 'non image', 'foreign image', 'invalid order']);

test('space with plans and section or lesson with children cannot be deleted', function () {
    [$course, $teacher, $space, $section, $lesson] = editorManagementData();
    $textId = DB::table('text_contents')->insertGetId(['body' => 'Keep this content']);
    $contentId = DB::table('contents')->insertGetId(['lesson_id' => $lesson->id, 'contentable_type' => TextContent::class, 'contentable_id' => $textId, 'description' => 'Existing content', 'order' => 1]);
    $this->actingAs($teacher->user);

    $this->delete(route('teacher.space.destroy', $space))->assertSessionHasErrors('delete');
    $this->delete(route('teacher.section.destroy', $section))->assertSessionHasErrors('delete');
    $this->delete(route('teacher.lesson.destroy', $lesson))->assertSessionHasErrors('delete');

    $this->assertModelExists($space);
    $this->assertModelExists($section);
    $this->assertModelExists($lesson);
    $this->assertDatabaseHas('contents', ['id' => $contentId]);
});

test('plan with historical enrollment or order is retained', function (string $dependency) {
    [$course, $teacher, , , , $plan] = editorManagementData();
    $user = User::factory()->create();
    if ($dependency === 'enrollment') {
        $studentId = $user->student->id;
        DB::table('enrollments')->insert(['plan_id' => $plan->id, 'student_id' => $studentId, 'is_active' => false]);
    } else {
        $walletId = $user->wallet->id;
        $orderId = DB::table('orders')->insertGetId(['wallet_id' => $walletId, 'status' => 'expired', 'amount' => 50]);
        $plan->orders()->attach($orderId, ['price' => 50]);
    }

    $this->actingAs($teacher->user)->delete(route('teacher.plan.destroy', $plan))->assertSessionHasErrors('delete');

    $this->assertModelExists($plan);
})->with(['enrollment', 'order']);

test('unused lesson and section delete without orphan prices', function () {
    Storage::fake('public');
    [$course, $teacher, , $section, $lesson, $plan] = editorManagementData(TeacherRole::Editor);
    Storage::disk('public')->put('cover.png', 'cover');
    $lesson->update(['thumbnail' => 'cover.png']);
    $lesson->pricings()->create(['plan_id' => $plan->id, 'price' => 50]);
    $this->actingAs($teacher->user);

    $this->delete(route('teacher.lesson.destroy', $lesson))->assertSessionHasNoErrors();
    $this->assertModelMissing($lesson);
    Storage::disk('public')->assertMissing('cover.png');
    $this->assertDatabaseMissing('pricings', ['lesson_id' => $lesson->id]);
    $this->delete(route('teacher.section.destroy', $section))->assertRedirect(route('teacher.course.editor', $course));
    $this->assertModelMissing($section);
});

dataset('editor mutations', [
    ['post', 'teacher.course.space.store', 0], ['put', 'teacher.space.update', 2], ['delete', 'teacher.space.destroy', 2],
    ['post', 'teacher.space.plan.store', 2], ['put', 'teacher.plan.update', 5], ['delete', 'teacher.plan.destroy', 5],
    ['post', 'teacher.course.section.store', 0], ['put', 'teacher.section.update', 3], ['delete', 'teacher.section.destroy', 3],
    ['post', 'teacher.section.lesson.store', 3], ['put', 'teacher.lesson.update', 4], ['delete', 'teacher.lesson.destroy', 4],
    ['patch', 'teacher.lesson.editor.update', 4],
]);

test('mutation endpoints return 404 for another course without changing data', function (string $method, string $routeName, int $index) {
    $data = editorManagementData();
    $stranger = Teacher::factory()->create();

    $this->actingAs($stranger->user)->{$method}(route($routeName, $data[$index]), ['name' => 'Unauthorized', 'price' => 0, 'order' => 1])->assertNotFound();

    foreach (['spaces', 'plans', 'sections', 'lessons'] as $table) {
        $this->assertDatabaseMissing($table, ['name' => 'Unauthorized']);
    }
    $this->assertModelExists($data[$index]);
})->with('editor mutations');

test('mutation endpoints reject a course member without editing permission', function (string $method, string $routeName, int $index) {
    $data = editorManagementData(TeacherRole::Reviewer);

    $this->actingAs($data[1]->user)->{$method}(route($routeName, $data[$index]), ['name' => 'Unauthorized', 'price' => 0, 'order' => 1])->assertForbidden();

    $this->assertModelExists($data[$index]);
})->with('editor mutations');

test('mutation endpoints require authentication', function (string $method, string $routeName, int $index) {
    $data = editorManagementData();

    $this->{$method}(route($routeName, $data[$index]), [])->assertRedirect(route('login'));

    $this->assertModelExists($data[$index]);
})->with('editor mutations');

test('plan rejects invalid prices without changing persisted values', function (mixed $price) {
    [$course, $teacher, , , , $plan] = editorManagementData();

    $this->actingAs($teacher->user)->put(route('teacher.plan.update', $plan), ['name' => 'Invalid', 'price' => $price])->assertSessionHasErrors('price');

    $this->assertDatabaseHas('plans', ['id' => $plan->id, 'name' => $plan->name, 'price' => $plan->price]);
})->with([-1, 1.5, 4294967296, 'invalid', '']);

test('exceeding gallery capacity rolls back lesson changes and removes only newly uploaded files', function () {
    Storage::fake('public');
    [$course, $teacher, , , $lesson] = editorManagementData();
    $images = [];
    foreach (range(1, 10) as $index) {
        $path = "gallery-{$index}.png";
        Storage::disk('public')->put($path, 'keep');
        $images[] = $path;
    }
    $lesson->update(['images' => $images]);

    $this->actingAs($teacher->user)->post(route('teacher.lesson.editor.update', $lesson), [
        '_method' => 'patch', 'name' => 'Should not save', 'order' => 1,
        'thumbnail_file' => editorTestImage(), 'image_files' => [editorTestImage('extra.png')],
    ])->assertSessionHasErrors('image_files');

    $this->assertDatabaseHas('lessons', ['id' => $lesson->id, 'name' => $lesson->name, 'thumbnail' => null]);
    expect($lesson->fresh()->images)->toBe($images);
    Storage::disk('public')->assertExists($images);
    Storage::disk('public')->assertCount('/', 10);
});
