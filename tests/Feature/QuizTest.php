<?php

use App\Enums\TeacherRole;
use App\Models\Access;
use App\Models\Attempt;
use App\Models\Content;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Quiz;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use App\Models\TextContent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('a final exam stores answers grades a completed attempt and limits participation', function () {
    $this->freezeTime();
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $quiz = DB::table('quizzes')->insertGetId(['space_id' => $space->id, 'time' => '00:10:00', 'score' => 0, 'title' => 'Exam', 'duration_seconds' => 600, 'correct_score' => 1, 'wrong_penalty' => 0.3, 'passing_score' => 30, 'guest_attempt_limit' => 1]);
    $space->update(['quiz_id' => $quiz]);
    foreach ([true, false] as $correct) {
        $question = DB::table('questions')->insertGetId(['space_id' => $space->id, 'body' => 'Question']);
        DB::table('question_quiz')->insert(['question_id' => $question, 'quiz_id' => $quiz, 'order' => $question]);
        $choice = DB::table('choices')->insertGetId(['question_id' => $question, 'body' => 'Choice', 'is_correct' => $correct]);
        $pairs[] = [$question, $choice];
    }
    $this->actingAs($user)->post(route('student.quiz.start', [$space, $quiz]))->assertRedirect();
    $attempt = DB::table('attempts')->where('student_id', $user->student->id)->sole();
    $this->get(route('student.quiz.show', $attempt->id))->assertInertia(fn (Assert $page) => $page->has('questions', 2)->missing('questions.0.choices.0.is_correct'));
    foreach ($pairs as [$question, $choice]) {
        $this->postJson(route('student.quiz.answer', $attempt->id), ['question_id' => $question, 'choice_id' => $choice])->assertOk();
        $log = DB::table('activity_logs')->where('event', 'quiz.answer.saved')->latest('id')->first();
        expect(json_decode($log->properties, true))->toMatchArray(['attempt_id' => $attempt->id, 'question_id' => $question, 'attributes' => ['choice_id' => $choice]]);
    }
    $this->post(route('student.quiz.finish', $attempt->id))->assertRedirect();
    expect((float) DB::table('attempts')->where('id', $attempt->id)->value('score'))->toEqual(33.33);
    $this->assertDatabaseHas('grades', ['space_id' => $space->id, 'student_id' => $user->student->id, 'attempt_id' => $attempt->id]);
    $token = DB::table('grades')->where('attempt_id', $attempt->id)->value('certificate_token');
    $this->get(route('student.quiz.show', $attempt->id))->assertInertia(fn (Assert $page) => $page->where('attempt.score', '33.33'));
    $this->get(route('certificate.show', $token))->assertOk()->assertInertia(fn (Assert $page) => $page->where('certificate.student', $user->name)->where('certificate.score', '33.33'));
    $this->get(route('student.certificate.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->has('certificates', 1)->where('certificates.0.score', '33.33')->where('certificates.0.url', route('certificate.show', $token)));
    $this->post(route('student.quiz.start', [$space, $quiz]))->assertSessionHasErrors('quiz');
});

test('a previously finished full score earns a certificate using the percentage threshold', function () {
    $user = User::factory()->create();
    $space = Space::factory()->for(Course::factory()->create(['is_published' => true]))->create();
    $quiz = DB::table('quizzes')->insertGetId(['space_id' => $space->id, 'time' => '00:10:00', 'score' => 0, 'correct_score' => 1, 'passing_score' => 80]);
    $space->update(['quiz_id' => $quiz]);
    $question = DB::table('questions')->insertGetId(['space_id' => $space->id, 'body' => 'Question']);
    DB::table('question_quiz')->insert(['question_id' => $question, 'quiz_id' => $quiz, 'order' => 0]);
    $attempt = DB::table('attempts')->insertGetId(['quiz_id' => $quiz, 'student_id' => $user->student->id, 'score' => 100, 'started_at' => now(), 'finished_at' => now()]);
    $this->actingAs($user)->get(route('student.certificate.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->has('certificates', 1));
    $this->assertDatabaseHas('grades', ['attempt_id' => $attempt, 'student_id' => $user->student->id]);
});

test('quiz results use equal questions and stay between zero and one hundred', function (float $penalty, array $answers, float $expected) {
    $user = User::factory()->create();
    $space = Space::factory()->for(Course::factory()->create(['is_published' => true]))->create();
    $quiz = DB::table('quizzes')->insertGetId(['space_id' => $space->id, 'time' => '00:10:00', 'score' => 0, 'wrong_penalty' => $penalty]);
    $space->update(['quiz_id' => $quiz]);
    $attempt = DB::table('attempts')->insertGetId(['quiz_id' => $quiz, 'student_id' => $user->student->id, 'started_at' => now()]);
    foreach ($answers as $index => $correct) {
        $question = DB::table('questions')->insertGetId(['space_id' => $space->id, 'body' => 'Question']);
        DB::table('question_quiz')->insert(['question_id' => $question, 'quiz_id' => $quiz, 'order' => $index]);
        if ($correct !== null) {
            $choice = DB::table('choices')->insertGetId(['question_id' => $question, 'body' => 'Choice', 'is_correct' => $correct]);
            DB::table('answers')->insert(['attempt_id' => $attempt, 'question_id' => $question, 'choice_id' => $choice]);
        }
    }

    $this->actingAs($user)->post(route('student.quiz.finish', $attempt))->assertRedirect();
    expect((float) DB::table('attempts')->where('id', $attempt)->value('score'))->toEqual($expected);
    $log = DB::table('activity_logs')->where('event', 'model.updated')->where('subject_type', Attempt::class)->where('subject_id', $attempt)->latest('id')->first();
    expect($log->actor_id)->toBe($user->id)
        ->and((float) json_decode($log->properties, true)['after']['score'])->toEqual($expected);
})->with([
    'three wrong cancel one correct' => [0.33, [true, true, false, false, false], 20.0],
    'no negative marking' => [0.0, [true, true, false, false, false], 40.0],
    'all wrong never becomes negative' => [0.33, [false, false, false, false, false], 0.0],
    'all correct earns full score' => [0.33, [true, true, true, true, true], 100.0],
    'unanswered questions count in the total' => [0.0, [true, true, null, null, null], 40.0],
]);

test('an existing content becomes a quiz only after the quiz editor is confirmed', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $lesson = Lesson::factory()->for(Section::factory()->for($course)->create(['order' => 1]))->create(['order' => 1]);
    $content = Content::factory()->text()->for($lesson)->create(['description' => 'Existing description']);
    Access::query()->create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    $this->actingAs($teacher->user)->get(route('teacher.quiz.editor', ['space' => $space, 'lesson' => $lesson->id, 'content' => $content->id]))
        ->assertOk()->assertInertia(fn (Assert $page) => $page->where('contentId', $content->id)->where('contentDescription', 'Existing description'));
    expect($content->fresh()->contentable_type)->toBe(TextContent::class);
    $this->post(route('teacher.quiz.save', $space), [
        'lesson_id' => $lesson->id, 'content_id' => $content->id, 'title' => 'Quiz', 'description' => 'Existing description',
        'duration_seconds' => 300, 'correct_score' => 1, 'wrong_penalty' => 0, 'guest_attempt_limit' => 3,
        'question_ids' => [], 'new_questions' => [['body' => 'Question', 'choices' => ['A', 'B', 'C', 'D'], 'correct' => 0]],
        'plans' => [['id' => $plan->id, 'enabled' => true, 'limit' => 2]],
    ])->assertSessionHasNoErrors();
    expect($content->fresh()->contentable_type)->toBe(Quiz::class);
    $this->assertDatabaseHas('accesses', ['content_id' => $content->id, 'plan_id' => $plan->id]);
});

test('expired attempts are finalized by the scheduled command', function () {
    $this->freezeTime();
    $user = User::factory()->create();
    $space = Space::factory()->for(Course::factory()->create(['is_published' => true]))->create();
    $quiz = DB::table('quizzes')->insertGetId(['space_id' => $space->id, 'time' => '00:00:05', 'score' => 0, 'duration_seconds' => 5]);
    $space->update(['quiz_id' => $quiz]);
    $question = DB::table('questions')->insertGetId(['space_id' => $space->id, 'body' => 'Question']);
    DB::table('question_quiz')->insert(['question_id' => $question, 'quiz_id' => $quiz, 'order' => 0]);
    $choice = DB::table('choices')->insertGetId(['question_id' => $question, 'body' => 'Choice', 'is_correct' => true]);
    $this->actingAs($user)->post(route('student.quiz.start', [$space, $quiz]))->assertRedirect();
    $attempt = DB::table('attempts')->where('student_id', $user->student->id)->sole();
    $this->postJson(route('student.quiz.answer', $attempt->id), ['question_id' => $question, 'choice_id' => $choice])->assertOk();
    $this->travel(6)->seconds();
    $this->artisan('quiz:finish-expired')->assertSuccessful();
    $this->assertDatabaseHas('attempts', ['id' => $attempt->id, 'score' => 100]);
    expect(DB::table('attempts')->where('id', $attempt->id)->value('finished_at'))->not->toBeNull();
});

test('attempts cannot accept answers after their deadline or from another student', function () {
    $this->freezeTime();
    $user = User::factory()->create();
    $space = Space::factory()->for(Course::factory()->create(['is_published' => true]))->create();
    $quiz = DB::table('quizzes')->insertGetId(['space_id' => $space->id, 'time' => '00:00:05', 'score' => 0, 'duration_seconds' => 5]);
    $space->update(['quiz_id' => $quiz]);
    $question = DB::table('questions')->insertGetId(['space_id' => $space->id, 'body' => 'Question']);
    DB::table('question_quiz')->insert(['question_id' => $question, 'quiz_id' => $quiz, 'order' => 0]);
    $choice = DB::table('choices')->insertGetId(['question_id' => $question, 'body' => 'Choice', 'is_correct' => true]);
    $this->actingAs($user)->post(route('student.quiz.start', [$space, $quiz]))->assertRedirect();
    $attempt = DB::table('attempts')->where('student_id', $user->student->id)->sole();
    $this->actingAs(User::factory()->create())->postJson(route('student.quiz.answer', $attempt->id), ['question_id' => $question, 'choice_id' => $choice])->assertNotFound();
    $this->travel(6)->seconds();
    $this->actingAs($user)->postJson(route('student.quiz.answer', $attempt->id), ['question_id' => $question, 'choice_id' => $choice])->assertUnprocessable();
    $this->get(route('student.quiz.show', $attempt->id))->assertOk();
    $this->assertDatabaseHas('attempts', ['id' => $attempt->id, 'score' => 0]);
});

test('the owner creates a lesson quiz with four choices and per-plan limits', function () {
    $course = Course::factory()->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => TeacherRole::Owner]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $lesson = Lesson::factory()->for(Section::factory()->for($course)->create(['order' => 1]))->create(['order' => 1]);
    $this->actingAs($teacher->user)->post(route('teacher.quiz.save', $space), [
        'lesson_id' => $lesson->id, 'title' => 'Quiz', 'description' => 'Description', 'duration_seconds' => 300,
        'correct_score' => 1, 'wrong_penalty' => 0.3, 'passing_score' => null, 'guest_attempt_limit' => 3,
        'question_ids' => [], 'new_questions' => [['body' => 'Question', 'choices' => ['A', 'B', 'C', 'D'], 'correct' => 1]],
        'plans' => [['id' => $plan->id, 'enabled' => true, 'limit' => 2]],
    ])->assertSessionHasNoErrors()->assertRedirect(route('teacher.course.editor', $course));
    $quiz = DB::table('quizzes')->where('space_id', $space->id)->sole();
    $this->assertDatabaseHas('plan_quiz', ['plan_id' => $plan->id, 'quiz_id' => $quiz->id, 'attempt_limit' => 2]);
    $this->assertDatabaseHas('contents', ['lesson_id' => $lesson->id, 'contentable_id' => $quiz->id, 'contentable_type' => Quiz::class]);
    expect(DB::table('choices')->where('is_correct', true)->count())->toBe(1);
});

test('the most generous active plan controls final exam attempts in its own space', function () {
    $user = User::factory()->create();
    $space = Space::factory()->for(Course::factory()->create(['is_published' => true]))->create();
    $first = Plan::factory()->for($space)->create();
    $second = Plan::factory()->for($space)->create();
    $user->student->plans()->attach($first, ['is_active' => true]);
    $user->student->plans()->attach($second, ['is_active' => true]);
    $quiz = DB::table('quizzes')->insertGetId(['space_id' => $space->id, 'time' => '00:10:00', 'score' => 0]);
    $space->update(['quiz_id' => $quiz]);
    DB::table('plan_quiz')->insert([['plan_id' => $first->id, 'quiz_id' => $quiz, 'attempt_limit' => 1], ['plan_id' => $second->id, 'quiz_id' => $quiz, 'attempt_limit' => null]]);
    $question = DB::table('questions')->insertGetId(['space_id' => $space->id, 'body' => 'Question']);
    DB::table('question_quiz')->insert(['question_id' => $question, 'quiz_id' => $quiz, 'order' => 0]);
    $this->actingAs($user);
    foreach (range(1, 2) as $number) {
        $this->post(route('student.quiz.start', [$space, $quiz]))->assertSessionHasNoErrors();
        $attempt = DB::table('attempts')->where('student_id', $user->student->id)->latest('id')->first();
        $this->post(route('student.quiz.finish', $attempt->id))->assertSessionHasNoErrors();
    }
    expect(DB::table('attempts')->where('student_id', $user->student->id)->count())->toBe(2);
    $this->get(route('student.enrollment.index'))->assertInertia(fn (Assert $page) => $page
        ->where('spaces.0.quizzes.0.id', $quiz)->where('spaces.0.quizzes.0.limit', null)
        ->where('spaces.0.quizzes.0.canStart', true)->has('spaces.0.quizzes.0.attempts', 2));
    $other = Space::factory()->for($space->course)->create();
    $this->post(route('student.quiz.start', [$other, $quiz]))->assertNotFound();
});

test('lesson access requires the specified space grade and score', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();
    $space = Space::factory()->for($course)->create();
    $prerequisite = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $user->student->plans()->attach($plan, ['is_active' => true]);
    $lesson = Lesson::factory()->for(Section::factory()->for($course)->create(['order' => 1]))->create(['order' => 1]);
    $content = Content::factory()->text()->for($lesson)->create();
    $access = Access::query()->create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    DB::table('requirements')->insert(['access_id' => $access->id, 'space_id' => $prerequisite->id, 'score' => 1]);
    $quiz = DB::table('quizzes')->insertGetId(['space_id' => $prerequisite->id, 'time' => '00:10:00', 'score' => 0, 'correct_score' => 2]);
    $prerequisite->update(['quiz_id' => $quiz]);
    $question = DB::table('questions')->insertGetId(['space_id' => $prerequisite->id, 'body' => 'Question']);
    DB::table('question_quiz')->insert(['quiz_id' => $quiz, 'question_id' => $question, 'order' => 0]);
    $this->actingAs($user)->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page
        ->where('contents.0.type', 'locked')->missing('contents.0.body'));
    $this->post(route('student.study.visit', [$space, $lesson]))->assertRedirect();
    $this->assertDatabaseMissing('progress', ['content_id' => $content->id]);
    $attempt = DB::table('attempts')->insertGetId(['quiz_id' => $quiz, 'student_id' => $user->student->id, 'score' => 50, 'finished_at' => now()]);
    $this->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page->where('contents.0.type', 'locked'));
    DB::table('grades')->insert(['space_id' => $prerequisite->id, 'student_id' => $user->student->id, 'attempt_id' => $attempt]);
    DB::table('requirements')->where('access_id', $access->id)->update(['score' => 51]);
    $this->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page->where('contents.0.type', 'locked'));
    DB::table('requirements')->where('access_id', $access->id)->update(['score' => 50]);
    $this->get(route('student.study.lesson', [$space, $lesson]))->assertInertia(fn (Assert $page) => $page->where('contents.0.type', 'text'));
});
