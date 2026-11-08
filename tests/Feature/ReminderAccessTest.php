<?php

use App\Enums\TeacherRole;
use App\Models\Access;
use App\Models\Content;
use App\Models\Course;
use App\Models\FileContent;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\RemindContent;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('reminder grants allow selection but not course management and revocation preserves existing reminders', function () {
    $teacher = Teacher::factory()->create();
    $destination = Course::factory()->create();
    $destination->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $lesson = Lesson::factory()->state(['order' => 1])->for(Section::factory()->state(['order' => 1])->for($destination))->create();
    $source = Course::factory()->create();
    $sourceOwner = Teacher::factory()->create();
    $source->teachers()->attach($sourceOwner, ['role' => TeacherRole::Owner]);
    $this->actingAs($sourceOwner->user)->put(route('teacher.course.editor.teachers', $source), ['teachers' => [
        ['id' => $sourceOwner->id, 'role' => 'owner'], ['id' => $teacher->id, 'role' => 'reminder'],
    ]])->assertSessionHasNoErrors();
    $sourceLesson = Lesson::factory()->state(['order' => 1])->for(Section::factory()->state(['order' => 1])->for($source))->create();
    $target = Content::factory()->text()->for($sourceLesson)->create();
    $this->actingAs($teacher->user);

    $this->get(route('teacher.course.index'))->assertInertia(fn (Assert $page) => $page->has('courses', 1)->where('courses.0.id', $destination->id));
    $this->get(route('teacher.course.editor', $source))->assertNotFound();
    $this->get(route('teacher.lesson.content.index', $sourceLesson))->assertNotFound();
    $this->delete(route('teacher.course.destroy', $source))->assertForbidden();
    $this->getJson(route('teacher.course.editor.reminder-sources', $destination))->assertOk()->assertJsonFragment(['id' => $source->id]);
    $this->getJson(route('teacher.course.editor.reminder-sources', [$destination, 'source' => $source->id]))->assertOk()->assertJsonFragment(['id' => $sourceLesson->id]);
    $this->getJson(route('teacher.course.editor.reminder-sources', [$destination, 'source' => $source->id, 'lesson' => $sourceLesson->id]))->assertOk()->assertJsonFragment(['id' => $target->id]);
    $this->getJson(route('teacher.course.editor.reminder-sources', [$destination, 'source' => $source->id, 'lesson' => $sourceLesson->id, 'content' => $target->id]))->assertOk()->assertJsonPath('body', $target->contentable->body);
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'remind', 'content_id' => $target->id])->assertSessionHasNoErrors();
    $reminder = $lesson->contents()->firstOrFail();
    $source->teachers()->detach($teacher);

    $this->getJson(route('teacher.course.editor.reminder-sources', [$destination, 'source' => $source->id]))->assertNotFound();
    $this->post(route('teacher.lesson.editor.contents.store', $lesson), ['type' => 'remind', 'content_id' => $target->id])->assertSessionHasErrors('content_id');
    $this->patch(route('teacher.content.editor.update', $reminder), ['type' => 'remind', 'content_id' => $target->id])->assertSessionHasNoErrors();
    expect($reminder->fresh()->contentable->content_id)->toBe($target->id);
});

test('a reminder shows its target and selects the correct link based on source access', function () {
    $user = User::factory()->create();
    $destination = Course::factory()->create();
    $space = Space::factory()->for($destination)->create();
    $plan = Plan::factory()->for($space)->create();
    $lesson = Lesson::factory()->state(['order' => 1])->for(Section::factory()->state(['order' => 1])->for($destination))->create();
    $source = Course::factory()->create(['is_published' => true]);
    $sourceSpace = Space::factory()->for($source)->create();
    $sourcePlan = Plan::factory()->for($sourceSpace)->create();
    $sourceLesson = Lesson::factory()->state(['order' => 1])->for(Section::factory()->state(['order' => 1])->for($source))->create();
    $target = Content::factory()->text()->for($sourceLesson)->create();
    Access::create(['plan_id' => $sourcePlan->id, 'content_id' => $target->id]);
    $record = RemindContent::create(['content_id' => $target->id]);
    $reminder = Content::factory()->for($lesson)->create(['contentable_type' => RemindContent::class, 'contentable_id' => $record->id]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $reminder->id]);
    $user->student->plans()->attach($plan, ['is_active' => true]);
    $this->actingAs($user);

    $this->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.target.body', $target->contentable->body)->where('contents.0.sourceAccessible', false)
        ->where('contents.0.sourceUrl', route('course.show', ['course' => $source->slug, 'reminder' => $target->id]).'#course-learning'));
    $this->get(route('course.show', ['course' => $source->slug, 'reminder' => $target->id]))->assertInertia(fn (Assert $page) => $page->where('reminderPlanIds.0', $sourcePlan->id));
    $user->student->plans()->attach($sourcePlan, ['is_active' => true]);
    $this->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.sourceAccessible', true)->where('contents.0.sourceUrl', route('student.study.lesson', [$sourceSpace, $sourceLesson]).'#content-'.$target->id));
});

test('reminder downloads are limited to students allowed to view the reminder', function () {
    Storage::fake('local');
    Storage::disk('local')->put('reminder.pdf', 'document');
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $lesson = Lesson::factory()->state(['order' => 1])->for(Section::factory()->state(['order' => 1])->for($course))->create();
    $file = FileContent::create(['name' => 'reminder.pdf', 'path' => 'reminder.pdf']);
    $target = Content::factory()->for($lesson)->create(['contentable_type' => FileContent::class, 'contentable_id' => $file->id]);
    $record = RemindContent::create(['content_id' => $target->id]);
    $reminder = Content::factory()->for($lesson)->create(['contentable_type' => RemindContent::class, 'contentable_id' => $record->id]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $reminder->id]);
    $user->student->plans()->attach($plan, ['is_active' => true]);
    $url = route('student.study.reminder-download', [$space, $reminder]);
    $this->actingAs($user)->get($url)->assertOk();
    $this->get(route('student.study.download', [$space, $target]))->assertNotFound();
    $this->actingAs(User::factory()->create())->get($url)->assertNotFound();
});
