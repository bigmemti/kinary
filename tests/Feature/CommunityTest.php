<?php

use App\Models\Access;
use App\Models\Comment;
use App\Models\Content;
use App\Models\Course;
use App\Models\Discussion;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('site feedback requires a member and awaits moderation', function () {
    $this->post(route('community.comments.store'), ['type' => 'site', 'body' => 'Good'])
        ->assertRedirect(route('login'));
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('community.comments.store'), ['type' => 'site', 'body' => 'Good'])
        ->assertRedirect();
    $this->assertDatabaseHas('comments', ['user_id' => $user->id, 'body' => 'Good', 'status' => 'pending', 'commentable_type' => null]);
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('comments', []));
    $this->assertDatabaseHas('activity_logs', ['event' => 'model.created', 'subject_type' => Comment::class, 'actor_id' => $user->id]);
});

test('course comments are visible immediately and replies cannot cross targets', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_published' => true]);
    $other = Course::factory()->create(['is_published' => true]);
    $this->actingAs($user)->post(route('community.comments.store'), ['type' => 'course', 'target_id' => $course->id, 'body' => 'First'])->assertRedirect();
    $comment = Comment::query()->where('body', 'First')->firstOrFail();
    $this->assertSame('visible', $comment->status);
    $this->post(route('community.comments.store'), ['type' => 'course', 'target_id' => $other->id, 'parent_id' => $comment->id, 'body' => 'Wrong'])->assertNotFound();
    $this->post(route('community.comments.store'), ['type' => 'course', 'target_id' => $course->id, 'parent_id' => $comment->id, 'body' => 'Reply'])->assertRedirect();
    $this->assertDatabaseHas('comments', ['replay_id' => $comment->id, 'body' => 'Reply']);
});

test('private discussions enforce active enrollment and selected plans', function () {
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $allowedPlan = Plan::factory()->for($space)->create();
    $otherPlan = Plan::factory()->for($space)->create();
    $member = User::factory()->create();
    $outsider = User::factory()->create();
    $member->student->plans()->attach($allowedPlan, ['is_active' => true]);
    $outsider->student->plans()->attach($otherPlan, ['is_active' => true]);
    $discussion = Discussion::query()->create(['user_id' => $member->id, 'course_id' => $course->id, 'name' => 'Private', 'body' => 'Secret', 'is_public' => false]);
    $discussion->plans()->attach($allowedPlan);
    $this->get(route('community.show', $discussion))->assertNotFound();
    $this->actingAs($outsider)->get(route('community.show', $discussion))->assertNotFound();
    $this->post(route('community.comments.store'), ['type' => 'discussion', 'target_id' => $discussion->id, 'body' => 'No'])->assertNotFound();
    $this->actingAs($member)->get($discussion->url())->assertOk()->assertSee('noindex, nofollow');
});

test('lesson comments require eligible lesson content and never become public discussions', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $lesson = Lesson::factory()->for(Section::factory()->for($course)->create(['order' => 1]))->create(['order' => 1]);
    $content = Content::factory()->text()->for($lesson)->create(['order' => 1]);
    $user->student->plans()->attach($plan, ['is_active' => true]);
    $payload = ['type' => 'lesson', 'target_id' => $lesson->id, 'space_id' => $space->id, 'body' => 'Question'];
    $this->actingAs($user)->post(route('community.comments.store'), $payload)->assertNotFound();
    Access::create(['plan_id' => $plan->id, 'content_id' => $content->id]);
    $this->post(route('community.comments.store'), $payload)->assertRedirect();
    $comment = Comment::query()->where('body', 'Question')->firstOrFail();
    $this->post(route('community.store'), ['name' => 'Question', 'source_comment_id' => $comment->id, 'is_public' => true])->assertUnprocessable();
});

test('administrators can moderate feedback and hiding a source also hides its discussion', function () {
    $author = User::factory()->create();
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $comment = Comment::query()->create(['user_id' => $author->id, 'body' => 'Opinion', 'status' => 'pending']);
    $this->actingAs($author)->patch(route('community.comments.moderate', $comment), ['status' => 'visible'])->assertForbidden();
    $this->actingAs($admin)->patch(route('community.comments.moderate', $comment), ['status' => 'visible'])->assertRedirect();
    $discussion = Discussion::query()->create(['user_id' => $author->id, 'source_comment_id' => $comment->id, 'name' => 'Topic', 'body' => $comment->body, 'is_public' => true]);
    $this->patch(route('community.comments.moderate', $comment), ['status' => 'hidden'])->assertRedirect();
    $this->get(route('community.show', $discussion))->assertNotFound();
    $this->assertDatabaseHas('activity_logs', ['event' => 'model.updated', 'actor_id' => $admin->id, 'subject_type' => Comment::class, 'subject_id' => $comment->id]);
});

test('a course instructor can create a discussion for selected plans and the selection is logged', function () {
    $course = Course::factory()->create(['is_published' => true]);
    $space = Space::factory()->for($course)->create();
    $plan = Plan::factory()->for($space)->create();
    $teacher = Teacher::factory()->create();
    $course->teachers()->attach($teacher, ['role' => 'instructor']);
    $this->actingAs($teacher->user)->post(route('community.store'), [
        'name' => 'Private topic', 'body' => 'Details', 'course_id' => $course->id,
        'is_public' => false, 'plan_ids' => [$plan->id],
    ])->assertRedirect();
    $discussion = Discussion::query()->where('name', 'Private topic')->firstOrFail();
    $this->assertDatabaseHas('discussion_plan', ['discussion_id' => $discussion->id, 'plan_id' => $plan->id]);
    $this->assertDatabaseHas('activity_logs', ['event' => 'discussion.plans.changed', 'actor_id' => $teacher->user_id, 'subject_id' => $discussion->id]);
});

test('converted comments use their text for the title and a short canonical slug', function () {
    $user = User::factory()->create();
    $body = str_repeat('آموزش لاراول ', 30);
    $comment = Comment::query()->create(['user_id' => $user->id, 'body' => $body, 'status' => 'visible']);
    $this->actingAs($user)->post(route('community.store'), [
        'source_comment_id' => $comment->id, 'is_public' => true,
    ])->assertRedirect();
    $discussion = Discussion::query()->where('source_comment_id', $comment->id)->firstOrFail();
    expect($discussion->name)->toBe(Str::limit(trim($body), 200, ''))
        ->and(mb_strlen($discussion->slug()))->toBeLessThanOrEqual(80);
    $this->get(route('community.show', $discussion))->assertRedirect($discussion->url())->assertStatus(301);
    $this->get($discussion->url())->assertOk()->assertSee($discussion->name)->assertDontSee('noindex, nofollow');
    $this->get('/sitemap.xml')->assertSee($discussion->url(), false);
});

test('private and hidden discussions never appear in the sitemap', function () {
    $author = User::factory()->create();
    $course = Course::factory()->create(['is_published' => true]);
    $comment = Comment::query()->create(['user_id' => $author->id, 'body' => 'Hidden', 'status' => 'hidden']);
    $hidden = Discussion::query()->create(['user_id' => $author->id, 'source_comment_id' => $comment->id, 'name' => 'Hidden topic', 'body' => 'Hidden', 'is_public' => true]);
    $private = Discussion::query()->create(['user_id' => $author->id, 'course_id' => $course->id, 'name' => 'Private topic', 'body' => 'Private', 'is_public' => false]);
    $this->get('/sitemap.xml')->assertDontSee($hidden->url(), false)->assertDontSee($private->url(), false);
    $this->get(route('community.show', $private))->assertNotFound();
});
