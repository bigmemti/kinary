<?php

use App\Enums\TeacherRole;
use App\Models\Access;
use App\Models\Assignment;
use App\Models\Content;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function homeworkFixture(): array
{
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $section = Section::factory()->for($course)->create(['order' => 1]);
    $lesson = Lesson::factory()->for($section)->create(['order' => 1]);
    $assignment = new Assignment;
    $assignment->body = 'Solve it';
    $assignment->allowed_extensions = ['txt', 'py'];
    $assignment->save();
    $content = Content::factory()->for($lesson)->create(['order' => 1, 'contentable_type' => Assignment::class, 'contentable_id' => $assignment->id]);
    Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    $user = User::factory()->create();
    $user->student->plans()->attach($plan, ['is_active' => true]);

    return [$teacher, $user, $space, $content];
}

test('students submit files and can remove only before approval', function () {
    Storage::fake('local');
    [$teacher, $student, $space, $content] = homeworkFixture();
    $this->actingAs($student)->post(route('student.homework.store', [$space, $content]), ['files' => [UploadedFile::fake()->createWithContent('solution.py', 'print(1)')]])->assertSessionHasNoErrors();
    $submission = DB::table('submissions')->first();
    $file = DB::table('submission_files')->first();
    $this->assertDatabaseHas('activity_logs', ['event' => 'homework.submitted', 'actor_id' => $student->id]);
    Storage::disk('local')->assertExists($file->path);
    $this->post(route('student.homework.store', [$space, $content]), ['files' => [UploadedFile::fake()->createWithContent('again.txt', 'test')]])->assertSessionHasErrors('files');
    $this->actingAs($teacher->user)->post(route('teacher.homework.approve', [$content, $submission->id]), ['score' => 101])->assertSessionHasErrors('score');
    $this->post(route('teacher.homework.approve', [$content, $submission->id]), ['score' => 80, 'note' => 'good'])->assertSessionHasNoErrors();
    $this->actingAs($student)->delete(route('student.homework.destroy', [$space, $content]))->assertSessionHasErrors('files');
    $this->assertDatabaseHas('submissions', ['id' => $submission->id, 'score' => 80, 'note' => 'good']);
    $log = DB::table('activity_logs')->where('event', 'homework.reviewed')->sole();
    $properties = json_decode($log->properties, true);
    expect($properties['submission_id'])->toBe($submission->id)
        ->and($properties['before']['score'])->toBeNull()
        ->and($properties['after']['score'])->toBe(80)
        ->and($properties['after']['note'])->toBe('good');
});

test('submission validation and ownership are enforced', function () {
    Storage::fake('local');
    [, $student, $space, $content] = homeworkFixture();
    $this->actingAs($student)->post(route('student.homework.store', [$space, $content]), ['files' => [UploadedFile::fake()->createWithContent('wrong.pdf', 'test')]])->assertSessionHasErrors('files');
    $this->post(route('student.homework.store', [$space, $content]), ['files' => [UploadedFile::fake()->create('big.txt', 5121)]])->assertSessionHasErrors('files');
    $this->post(route('student.homework.store', [$space, $content]), ['files' => array_map(fn ($i) => UploadedFile::fake()->createWithContent("$i.txt", 'test'), range(1, 6))])->assertSessionHasErrors('files');
    $this->post(route('student.homework.store', [$space, $content]), ['files' => [UploadedFile::fake()->createWithContent('ok.txt', 'test')]])->assertSessionHasNoErrors();
    $path = DB::table('submission_files')->value('path');
    $stranger = User::factory()->create();
    $this->actingAs($stranger)->delete(route('student.homework.destroy', [$space, $content]))->assertNotFound();
    $this->actingAs($student)->delete(route('student.homework.destroy', [$space, $content]))->assertSessionHasNoErrors();
    Storage::disk('local')->assertMissing($path);
    $log = DB::table('activity_logs')->where('event', 'homework.deleted')->sole();
    expect(json_decode($log->properties, true)['files'][0]['name'])->toBe('ok.txt');
    $this->assertDatabaseCount('submissions', 0);
});

test('the course owner configures homework and answer release for each plan', function () {
    [$teacher, , $space, $content] = homeworkFixture();
    $secondPlan = Plan::factory()->for($space)->create();
    $firstPlan = $space->plans()->firstOrFail();

    $this->actingAs($teacher->user)->patch(route('teacher.content.editor.update', $content), [
        'type' => 'homework',
        'body' => 'سؤال جدید',
        'answer_body' => '**پاسخ**',
        'answer_video_url' => 'https://example.com/answer.mp4',
        'allowed_extensions' => 'pdf, py, png',
        'accesses' => [
            ['plan_id' => $firstPlan->id, 'answer_release' => 'approved', 'answer_video_release' => 'never'],
            ['plan_id' => $secondPlan->id, 'answer_release' => 'always', 'answer_video_release' => 'submitted'],
        ],
    ])->assertSessionHasNoErrors();

    expect($content->fresh()->contentable->allowed_extensions)->toBe(['pdf', 'py', 'png']);
    expect($content->fresh()->contentable->answer_body)->toBe('**پاسخ**');
    $this->assertDatabaseHas('accesses', ['content_id' => $content->id, 'plan_id' => $firstPlan->id, 'answer_release' => 'approved', 'answer_video_release' => 'never']);
    $this->assertDatabaseHas('accesses', ['content_id' => $content->id, 'plan_id' => $secondPlan->id, 'answer_release' => 'always', 'answer_video_release' => 'submitted']);

    $this->get(route('teacher.course.editor', $space->course))->assertInertia(fn (Assert $page) => $page
        ->loadDeferredProps(fn (Assert $reload) => $reload
            ->where('overview.sections.0.lessons.0.contents.0.type', 'homework')
            ->where('overview.sections.0.lessons.0.contents.0.body', 'سؤال جدید')
            ->where('overview.sections.0.lessons.0.contents.0.answer_body', '**پاسخ**')
            ->where('overview.sections.0.lessons.0.contents.0.answer_video_url', 'https://example.com/answer.mp4')
            ->where('overview.sections.0.lessons.0.contents.0.allowed_extensions', 'pdf, py, png')
            ->where('overview.sections.0.lessons.0.contents.0.accesses.0.answer_release', 'approved')
            ->where('overview.sections.0.lessons.0.contents.0.accesses.1.answer_video_release', 'submitted')));
});

test('text and video answers follow each plan independently and approval belongs to the student', function () {
    [, $student, $space, $content] = homeworkFixture();
    $assignment = $content->contentable;
    $assignment->answer_body = '**جواب محرمانه**';
    $assignment->answer_video_url = 'https://example.com/answer.mp4';
    $assignment->save();
    $access = $content->accesses()->firstOrFail();
    $access->answer_release = 'submitted';
    $access->answer_video_release = 'approved';
    $access->save();
    $url = route('student.study.lesson', [$space, $content->lesson]);

    $this->actingAs($student)->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.answer', null)->where('contents.0.answerVideoUrl', null));
    $other = User::factory()->create();
    DB::table('submissions')->insert(['assignment_id' => $assignment->id, 'student_id' => $other->student->id, 'body' => '', 'approved_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
    $this->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.answer', null)->where('contents.0.answerVideoUrl', null));
    $id = DB::table('submissions')->insertGetId(['assignment_id' => $assignment->id, 'student_id' => $student->student->id, 'body' => '', 'created_at' => now(), 'updated_at' => now()]);
    $this->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.answer', '**جواب محرمانه**')->where('contents.0.answerVideoUrl', null));
    DB::table('submissions')->where('id', $id)->update(['approved_at' => now()]);
    $this->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.answer', '**جواب محرمانه**')->where('contents.0.answerVideoUrl', 'https://example.com/answer.mp4'));
    $access->answer_release = 'never';
    $access->answer_video_release = 'never';
    $access->save();
    $this->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.answer', null)->where('contents.0.answerVideoUrl', null));
});

test('only active eligible plans grant the easiest answer access', function () {
    [, $student, $space, $content] = homeworkFixture();
    $assignment = $content->contentable;
    $assignment->answer_body = 'متن پاسخ';
    $assignment->answer_video_url = 'https://example.com/answer.mp4';
    $assignment->save();
    DB::table('accesses')->where('content_id', $content->id)->update(['answer_release' => 'never', 'answer_video_release' => 'never']);
    $plan = Plan::factory()->for($space)->create();
    $access = Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    DB::table('accesses')->where('id', $access->id)->update(['answer_release' => 'always', 'answer_video_release' => 'always']);
    $student->student->plans()->attach($plan, ['is_active' => false]);
    $url = route('student.study.lesson', [$space, $content->lesson]);
    $this->actingAs($student)->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.answer', null)->where('contents.0.answerVideoUrl', null));
    DB::table('enrollments')->where('student_id', $student->student->id)->where('plan_id', $plan->id)->update(['is_active' => true]);
    $prerequisite = Space::factory()->for($space->course)->create();
    DB::table('requirements')->insert(['access_id' => $access->id, 'space_id' => $prerequisite->id, 'score' => 80]);
    $this->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.answer', null)->where('contents.0.answerVideoUrl', null));
    DB::table('requirements')->where('access_id', $access->id)->delete();
    $this->get($url)->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.answer', 'متن پاسخ')->where('contents.0.answerVideoUrl', 'https://example.com/answer.mp4'));
});
