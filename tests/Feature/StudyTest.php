<?php

use App\Models\Access;
use App\Models\Content;
use App\Models\Course;
use App\Models\FileContent;
use App\Models\ImageContent;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Progress;
use App\Models\RemindContent;
use App\Models\Section;
use App\Models\Space;
use App\Models\TableContent;
use App\Models\User;
use App\Models\VideoContent;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/** @return array{User, Space, Plan, Lesson, Content} */
function studyFixture(): array
{
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $lesson = Lesson::factory()->for(Section::factory()->for($course)->create(['order' => 1]))->create(['order' => 1]);
    $content = Content::factory()->text()->for($lesson)->create(['order' => 1]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    $user->student->plans()->attach($plan, ['is_active' => true]);

    return [$user, $space, $plan, $lesson, $content];
}

test('library groups purchased plans by space and counts their combined content once', function () {
    [$user, $space, $plan, $lesson, $content] = studyFixture();
    $upgrade = Plan::factory()->for($space)->create();
    $user->student->plans()->attach($upgrade);
    Access::create(['plan_id' => $upgrade->id, 'content_id' => $content->id]);
    $extra = Content::factory()->text()->for($lesson)->create(['order' => 2]);
    Access::create(['plan_id' => $upgrade->id, 'content_id' => $extra->id]);
    Content::factory()->text()->for($lesson)->create(['description' => 'محتوای خریداری‌نشده']);
    $otherSpace = Space::factory()->for($space->course)->create();
    $otherPlan = Plan::factory()->for($otherSpace)->create();
    $user->student->plans()->attach($otherPlan);

    $this->actingAs($user)->get(route('student.enrollment.index'))->assertInertia(fn (Assert $page) => $page
        ->component('student/enrollment/index')->has('spaces', 2)
        ->where('spaces.0.id', $space->id)->has('spaces.0.plans', 2)
        ->where('spaces.0.totalCount', 2)->where('spaces.0.readCount', 0)->where('spaces.0.percentage', 0)
        ->where('spaces.0.resumeLessonId', $lesson->id)
        ->has('spaces.0.sections.0.lessons', 1)->missing('spaces.0.sections.0.lessons.0.contents')
        ->where('spaces.1.totalCount', 0)->where('spaces.1.resumeLessonId', null))
        ->assertDontSee($content->contentable->body);
});

test('opening a lesson records all accessible content once and moves its space to the top', function () {
    $this->freezeTime();
    [$user, $space, $plan, $lesson, $content] = studyFixture();
    $extra = Content::factory()->text()->for($lesson)->create(['order' => 2]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $extra->id]);
    $hidden = Content::factory()->text()->for($lesson)->create();
    $laterLesson = Lesson::factory()->for($lesson->section)->create(['order' => 2]);
    $remaining = Content::factory()->text()->for($laterLesson)->create();
    Access::create(['plan_id' => $plan->id, 'content_id' => $remaining->id]);
    $otherSpace = Space::factory()->for($space->course)->create();
    $otherPlan = Plan::factory()->for($otherSpace)->create();
    $user->student->plans()->attach($otherPlan, ['last_visited_at' => now()->subHour()]);

    $this->actingAs($user)->post(route('student.study.visit', [$space, $lesson]))
        ->assertRedirect(route('student.study.lesson', [$space, $lesson]));
    $this->post(route('student.study.visit', [$space, $lesson]))->assertRedirect();

    $this->assertDatabaseCount('progress', 2);
    $this->assertDatabaseHas('progress', ['content_id' => $content->id, 'status' => 'read']);
    $this->assertDatabaseHas('progress', ['content_id' => $extra->id, 'status' => 'read']);
    $this->assertDatabaseMissing('progress', ['content_id' => $hidden->id]);
    $this->assertDatabaseMissing('progress', ['content_id' => $remaining->id]);
    $this->assertDatabaseHas('enrollments', ['plan_id' => $plan->id, 'last_lesson_id' => $lesson->id, 'last_visited_at' => now()]);
    $this->get(route('student.enrollment.index'))->assertInertia(fn (Assert $page) => $page
        ->where('spaces.0.id', $space->id)->where('spaces.0.readCount', 2)
        ->where('spaces.0.totalCount', 3)->where('spaces.0.percentage', 66)
        ->where('spaces.1.readCount', 0));
});

test('lesson reader orders accessible content and navigation across sections without recording a preview', function () {
    [$user, $space, $plan, $first, $content] = studyFixture();
    $section = Section::factory()->for($space->course)->create(['order' => 2]);
    $next = Lesson::factory()->for($section)->create(['order' => 1]);
    $nextContent = Content::factory()->text()->for($next)->create();
    Access::create(['plan_id' => $plan->id, 'content_id' => $nextContent->id]);
    Lesson::factory()->for($first->section)->create(['order' => 2]);
    $before = Content::factory()->text()->for($first)->create(['order' => 0]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $before->id]);
    $hidden = Content::factory()->text()->for($first)->create();

    $this->actingAs($user)->get(route('student.study.lesson', [$space, $first]))->assertInertia(fn (Assert $page) => $page
        ->component('student/enrollment/show')->has('contents', 2)
        ->where('contents.0.id', $before->id)->where('contents.1.id', $content->id)
        ->where('contents.1.body', $content->contentable->body)
        ->where('previousLesson', null)->where('nextLesson.id', $next->id))
        ->assertDontSee($hidden->contentable->body);
    $this->assertDatabaseCount('progress', 0);
    $this->get(route('student.study.lesson', [$space, $next]))->assertInertia(fn (Assert $page) => $page
        ->where('previousLesson.id', $first->id)->where('nextLesson', null));
});

test('progress from an earlier plan survives an upgrade without counting shared content twice', function () {
    [$user, $space, $plan, $lesson, $content] = studyFixture();
    $enrollment = $user->student->enrollments()->sole();
    Progress::create(['content_id' => $content->id, 'enrollment_id' => $enrollment->id, 'status' => 'read', 'read_at' => now()]);
    $upgrade = Plan::factory()->for($space)->create();
    $user->student->plans()->attach($upgrade);
    Access::create(['plan_id' => $upgrade->id, 'content_id' => $content->id]);
    $user->student->plans()->updateExistingPivot($plan->id, ['is_active' => false]);

    $this->actingAs($user)->get(route('student.enrollment.index'))->assertInertia(fn (Assert $page) => $page
        ->has('spaces', 1)->where('spaces.0.readCount', 1)->where('spaces.0.totalCount', 1)->where('spaces.0.percentage', 100));
});

test('progress on shared course content stays separate between spaces', function () {
    [$user, $space, $plan, $lesson, $content] = studyFixture();
    $other = Space::factory()->for($space->course)->create();
    $otherPlan = Plan::factory()->for($other)->create();
    $user->student->plans()->attach($otherPlan);
    Access::create(['plan_id' => $otherPlan->id, 'content_id' => $content->id]);

    $this->actingAs($user)->post(route('student.study.visit', [$space, $lesson]))->assertRedirect();

    $this->get(route('student.enrollment.index'))->assertInertia(fn (Assert $page) => $page
        ->where('spaces.0.id', $space->id)->where('spaces.0.readCount', 1)
        ->where('spaces.1.id', $other->id)->where('spaces.1.readCount', 0));
});

test('unowned inactive and unrelated lessons cannot be read or recorded', function (string $case) {
    [$user, $space, $plan, $lesson] = studyFixture();
    if ($case === 'unowned') {
        $user = User::factory()->create();
    } elseif ($case === 'inactive') {
        $user->student->plans()->updateExistingPivot($plan->id, ['is_active' => false]);
    } elseif ($case === 'other-course') {
        $lesson = Lesson::factory()->for(Section::factory()->for(Course::factory()->create())->create(['order' => 1]))->create(['order' => 1]);
    } else {
        $lesson = Lesson::factory()->for($lesson->section)->create(['order' => 2]);
        Content::factory()->text()->for($lesson)->create();
    }

    $this->actingAs($user)->get(route('student.study.lesson', [$space, $lesson]))->assertNotFound();
    $this->post(route('student.study.visit', [$space, $lesson]))->assertNotFound();

    $this->assertDatabaseCount('progress', 0);
    $this->assertDatabaseMissing('enrollments', ['last_lesson_id' => $lesson->id]);
})->with(['unowned', 'inactive', 'other-course', 'unassigned']);

test('private lesson files are downloadable only with access in the requested space', function () {
    Storage::fake('local');
    [$user, $space, $plan, $lesson] = studyFixture();
    Storage::disk('local')->put('study/private.pdf', 'private document');
    $file = FileContent::create(['path' => 'study/private.pdf', 'name' => 'جزوه.pdf']);
    $content = Content::factory()->for($lesson)->create(['contentable_type' => FileContent::class, 'contentable_id' => $file->id]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);

    $response = $this->actingAs($user)->get(route('student.study.download', [$space, $content]))->assertDownload();
    expect($response->headers->get('Content-Disposition'))->toContain("filename*=utf-8''".rawurlencode('جزوه.pdf'));
    $this->actingAs(User::factory()->create())->get(route('student.study.download', [$space, $content]))->assertNotFound();
});

test('reminders expose only their selected target even without a source plan', function () {
    [$user, $space, $plan, $lesson] = studyFixture();
    $private = Content::factory()->text()->for($lesson)->create();
    $remind = RemindContent::create(['content_id' => $private->id]);
    $content = Content::factory()->for($lesson)->create(['order' => 2, 'contentable_type' => RemindContent::class, 'contentable_id' => $remind->id]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);

    $this->actingAs($user)->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page
        ->where('contents.1.type', 'remind')->where('contents.1.target.body', $private->contentable->body)
        ->where('contents.1.sourceAccessible', false));
});

test('study pages require authentication', function () {
    [, $space, , $lesson, $content] = studyFixture();

    $this->get(route('student.enrollment.index'))->assertRedirect(route('login'));
    $this->get(route('student.study.lesson', [$space, $lesson]))->assertRedirect(route('login'));
    $this->post(route('student.study.visit', [$space, $lesson]))->assertRedirect(route('login'));
    $this->get(route('student.study.download', [$space, $content]))->assertRedirect(route('login'));

    $this->assertDatabaseCount('progress', 0);
});

test('a student without purchases sees an empty library', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('student.enrollment.index'))->assertInertia(fn (Assert $page) => $page
        ->component('student/enrollment/index')->where('spaces', []));
});

test('lesson media and tables use safe display data without exposing private storage paths', function () {
    [$user, $space, $plan, $lesson] = studyFixture();
    $image = ImageContent::create(['name' => 'تصویر درس', 'path' => 'courses/image.png']);
    $video = VideoContent::create(['name' => 'ویدیوی درس', 'path' => 'https://example.test/lesson.mp4']);
    $unsafeVideo = VideoContent::create(['name' => 'نشانی نامعتبر', 'path' => 'javascript:alert(1)']);
    $file = FileContent::create(['name' => 'جزوه', 'path' => 'private/secret.pdf']);
    $table = TableContent::create(['table' => [['عنوان', 'مقدار'], ['نمونه', 'یک']]]);
    foreach ([$image, $video, $unsafeVideo, $file, $table] as $index => $record) {
        $content = Content::factory()->for($lesson)->create(['order' => $index + 2, 'contentable_type' => $record::class, 'contentable_id' => $record->id]);
        Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    }

    $this->actingAs($user)->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page
        ->has('contents', 6)->where('contents.1.type', 'image')->where('contents.1.name', 'تصویر درس')
        ->where('contents.2.type', 'video')->where('contents.2.url', 'https://example.test/lesson.mp4')
        ->where('contents.3.url', null)->where('contents.4.type', 'file')
        ->where('contents.5.type', 'table')->where('contents.5.rows', [['عنوان', 'مقدار'], ['نمونه', 'یک']]))
        ->assertDontSee('private/secret.pdf')->assertDontSee('javascript:alert(1)');
});

test('legacy enrollment links open the corresponding space and hide other students records', function () {
    [$user, $space] = studyFixture();
    $enrollment = $user->student->enrollments()->sole();

    $this->actingAs($user)->get(route('student.enrollment.show', $enrollment))
        ->assertRedirect(route('student.enrollment.index', ['space' => $space->id]));
    $this->actingAs(User::factory()->create())->get(route('student.enrollment.show', $enrollment))->assertNotFound();
});

test('users without the student role cannot reach study endpoints', function () {
    [$user, $space, , $lesson, $content] = studyFixture();
    $user->removeRole('student');

    $this->actingAs($user)->get(route('student.enrollment.index'))->assertForbidden();
    $this->get(route('student.study.lesson', [$space, $lesson]))->assertForbidden();
    $this->post(route('student.study.visit', [$space, $lesson]))->assertForbidden();
    $this->get(route('student.study.download', [$space, $content]))->assertForbidden();

    $this->assertDatabaseCount('progress', 0);
});

test('continue opens the first lesson with unread accessible content in curriculum order', function (array $readKeys, int $expectedLessonIndex) {
    [$user, $space, $plan, $firstLesson, $firstContent] = studyFixture();
    $secondLesson = Lesson::factory()->for($firstLesson->section)->create(['order' => 2]);
    $lastSection = Section::factory()->for($space->course)->create(['order' => 2]);
    $lastLesson = Lesson::factory()->for($lastSection)->create(['order' => 1]);
    $contents = [
        'first' => $firstContent,
        'first-extra' => Content::factory()->text()->for($firstLesson)->create(['order' => 2]),
        'second' => Content::factory()->text()->for($secondLesson)->create(['order' => 0]),
        'last' => Content::factory()->text()->for($lastLesson)->create(['order' => 0]),
    ];
    foreach (array_slice($contents, 1) as $content) {
        Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    }
    Content::factory()->text()->for($firstLesson)->create(['order' => 3]);
    $enrollment = $user->student->enrollments()->sole();
    $enrollment->forceFill(['last_visited_at' => now(), 'last_lesson_id' => $lastLesson->id])->save();
    foreach ($readKeys as $key) {
        Progress::create(['content_id' => $contents[$key]->id, 'enrollment_id' => $enrollment->id, 'status' => 'read', 'read_at' => now()]);
    }
    $lessons = [$firstLesson, $secondLesson, $lastLesson];

    $this->actingAs($user)->get(route('student.enrollment.index'))->assertInertia(fn (Assert $page) => $page
        ->where('spaces.0.resumeLessonId', $lessons[$expectedLessonIndex]->id));
})->with([
    'partially read lesson comes before last visited lesson' => [['first'], 0],
    'completed lesson is skipped even if unpurchased content remains' => [['first', 'first-extra'], 1],
    'fully read space keeps the last visited lesson' => [['first', 'first-extra', 'second', 'last'], 2],
]);

test('students receive the saved embed player source for accessible video', function () {
    [$user, $space, $plan, $lesson] = studyFixture();
    $video = VideoContent::create(['name' => 'Video', 'path' => 'embed:https://www.youtube.com/embed/abc']);
    $content = Content::factory()->for($lesson)->create(['order' => 2, 'contentable_type' => $video::class, 'contentable_id' => $video->id]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);

    $this->actingAs($user)->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page
        ->where('contents.1.type', 'video')->where('contents.1.url', 'embed:https://www.youtube.com/embed/abc'));
});
