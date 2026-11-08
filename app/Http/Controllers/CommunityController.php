<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Course;
use App\Models\Discussion;
use App\Models\Lesson;
use App\Models\Plan;
use App\Services\ActivityLogger;
use App\Services\CommunityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Response;

class CommunityController extends Controller
{
    public function storeComment(Request $request, CommunityService $community): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['site', 'course', 'lesson', 'discussion'])],
            'target_id' => ['nullable', 'integer'],
            'space_id' => ['nullable', 'integer'],
            'parent_id' => ['nullable', 'integer'],
            'body' => ['required', 'string', 'max:5000'],
        ]);
        $target = $community->target($data['type'], $data['target_id'] ?? null, $data['space_id'] ?? null, $request->user());
        if (! empty($data['parent_id'])) {
            $parent = Comment::query()->whereKey($data['parent_id'])->where('status', 'visible')->firstOrFail();
            abort_unless($parent->commentable_type === $target?->getMorphClass() && $parent->commentable_id === $target?->getKey(), 404);
        }
        Comment::query()->create([
            'user_id' => $request->user()->id, 'replay_id' => $data['parent_id'] ?? null,
            'commentable_type' => $target?->getMorphClass(), 'commentable_id' => $target?->getKey(),
            'body' => $data['body'], 'status' => $data['type'] === 'site' ? 'pending' : 'visible',
        ]);

        return back()->with('success', $data['type'] === 'site' ? 'نظر شما برای بررسی ثبت شد.' : 'نظر شما ثبت شد.');
    }

    public function moderate(Request $request, Comment $comment, CommunityService $community): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['visible', 'hidden'])]]);
        abort_unless($community->canModerate($request->user(), $community->courseFor($comment->commentable)), 403);
        $comment->update(['status' => $data['status']]);

        return back()->with('success', 'وضعیت نظر تغییر کرد.');
    }

    public function moderation(Request $request, CommunityService $community): Response
    {
        $user = $request->user();
        abort_unless($user->hasRole('admin') || $user->teacher, 403);
        $comments = Comment::query()->with(['author:id,name', 'commentable'])->whereIn('status', ['pending', 'hidden', 'visible'])
            ->latest('id')->get()->filter(fn (Comment $comment): bool => $community->canModerate($user, $community->courseFor($comment->commentable)))
            ->map(fn (Comment $comment): array => [
                'id' => $comment->id, 'body' => $comment->body, 'status' => $comment->status,
                'author' => $comment->author?->name ?? 'کاربر',
                'context' => $community->courseFor($comment->commentable)?->title ?? 'نظر درباره سایت',
            ])->values()->all();

        return inertia('community/moderation', ['comments' => $comments, 'canonicalUrl' => route('community.moderation')]);
    }

    public function index(Request $request, CommunityService $community): Response
    {
        $discussions = Discussion::query()->with(['author:id,name', 'course', 'lesson'])->latest('id')->get()
            ->filter(fn (Discussion $discussion): bool => $community->canViewDiscussion($request->user(), $discussion))
            ->map(fn (Discussion $discussion): array => [
                'id' => $discussion->id, 'name' => $discussion->name, 'author' => $discussion->author?->name ?? 'کاربر',
                'url' => $discussion->url(),
                'course' => $discussion->course?->title, 'isPublic' => $discussion->is_public,
            ])->values()->all();
        $courses = $request->user()?->hasRole('admin')
            ? Course::query()->where('is_published', true)
            : Course::query()->where('is_published', true)->whereHas('teachers', fn ($query) => $query
                ->where('teachers.user_id', $request->user()?->id)
                ->whereIn('course_teacher.role', ['owner', 'instructor']));
        $courses = $courses->with(['spaces.plans', 'sections.lessons'])->get()->map(fn (Course $course): array => [
            'id' => $course->id, 'title' => $course->title,
            'plans' => $course->spaces->flatMap(fn ($space) => $space->plans->map(fn ($plan) => [
                'id' => $plan->id, 'name' => $space->name.' - '.$plan->name,
            ]))->values(),
            'lessons' => $course->sections->flatMap(fn ($section) => $section->lessons->map(fn ($lesson) => [
                'id' => $lesson->id, 'name' => $lesson->name,
            ]))->values(),
        ]);

        return inertia('community/index', ['discussions' => $discussions, 'courses' => $courses, 'canonicalUrl' => route('community.index')]);
    }

    public function show(Request $request, Discussion $discussion, CommunityService $community, ?string $slug = null): Response|RedirectResponse
    {
        $discussion->load(['author', 'course', 'lesson']);
        abort_unless($community->canViewDiscussion($request->user(), $discussion), 404);
        if ($slug !== $discussion->slug()) {
            return redirect()->to($discussion->url(), 301);
        }

        $description = Str::limit(trim(preg_replace('/\s+/u', ' ', strip_tags($discussion->body ?? $discussion->name))), 160);

        return inertia('community/show', [
            'discussion' => [
                'id' => $discussion->id, 'name' => $discussion->name, 'body' => $discussion->body,
                'author' => $discussion->author?->name ?? 'کاربر', 'isPublic' => $discussion->is_public,
                'course' => $discussion->course?->title,
            ],
            'comments' => $community->comments($discussion, $request->user()),
            'canonicalUrl' => $discussion->url(),
            'description' => $description,
        ])->withViewData([
            'storefrontTitle' => $discussion->name.' | آکادمی',
            'storefrontDescription' => $description,
            'storefrontRobots' => $discussion->is_public ? null : 'noindex, nofollow',
        ]);
    }

    public function storeDiscussion(Request $request, CommunityService $community): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required_without:source_comment_id', 'nullable', 'string', 'max:200'],
            'body' => ['required_without:source_comment_id', 'nullable', 'string', 'max:10000'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
            'source_comment_id' => ['nullable', 'integer', 'exists:comments,id', Rule::unique('discussions', 'source_comment_id')],
            'is_public' => ['required', 'boolean'], 'plan_ids' => ['array'],
            'plan_ids.*' => ['integer', 'distinct', 'exists:plans,id'],
        ]);
        $source = ! empty($data['source_comment_id']) ? Comment::query()->with('commentable')->findOrFail($data['source_comment_id']) : null;
        $target = $source?->commentable;
        $course = ! empty($data['course_id']) ? Course::query()->findOrFail($data['course_id']) : null;
        $lesson = ! empty($data['lesson_id']) ? Lesson::query()->with('section.course')->findOrFail($data['lesson_id']) : null;
        if ($source) {
            abort_unless($source->status === 'visible' && ($source->user_id === $request->user()->id
                || $community->canModerate($request->user(), $community->courseFor($target))), 403);
            abort_unless($target === null || $target instanceof Course || $target instanceof Lesson, 422);
            $course = $community->courseFor($target);
            $lesson = $target instanceof Lesson ? $target : null;
        }
        abort_if($lesson && (! $course || $lesson->section->course_id !== $course->id), 422);
        abort_if($lesson && $data['is_public'], 422);
        abort_if($course && ! $course->is_published, 404);
        $moderator = $community->canModerate($request->user(), $course);
        if (! $data['is_public']) {
            abort_unless($course && ($moderator || ($source && $source->user_id === $request->user()->id && $lesson)), 403);
        }
        if ($lesson && ! $source) {
            abort_unless($moderator, 403);
        }
        $planIds = $data['plan_ids'] ?? [];
        abort_if($planIds && (! $moderator || $data['is_public']), 403);
        abort_if($planIds && Plan::query()->whereIn('id', $planIds)->whereHas('space', fn ($query) => $query->where('course_id', $course?->id))->count() !== count($planIds), 422);
        $discussion = DB::transaction(function () use ($data, $source, $course, $lesson, $planIds, $request): Discussion {
            $discussion = Discussion::query()->create([
                'user_id' => $source?->user_id ?? $request->user()->id, 'course_id' => $course?->id, 'lesson_id' => $lesson?->id,
                'source_comment_id' => $source?->id, 'name' => $source ? Str::limit(trim(preg_replace('/\s+/u', ' ', $source->body)), 200, '') : $data['name'],
                'body' => $source?->body ?? $data['body'], 'is_public' => $data['is_public'],
            ]);
            if ($planIds) {
                $discussion->plans()->attach($planIds);
                app(ActivityLogger::class)->recordChanges('discussion.plans.changed', [], $planIds, $discussion);
            }

            return $discussion;
        });

        return redirect()->to($discussion->url());
    }
}
