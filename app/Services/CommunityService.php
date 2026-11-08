<?php

namespace App\Services;

use App\Enums\TeacherRole;
use App\Models\Comment;
use App\Models\Course;
use App\Models\Discussion;
use App\Models\Lesson;
use App\Models\Space;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class CommunityService
{
    public function canModerate(?User $user, ?Course $course): bool
    {
        if (! $user) {
            return false;
        }
        if ($user->hasRole('admin')) {
            return true;
        }

        return $course !== null && $course->teachers()->where('teachers.user_id', $user->id)
            ->whereIn('course_teacher.role', [TeacherRole::Owner->value, TeacherRole::Instructor->value])->exists();
    }

    public function canViewDiscussion(?User $user, Discussion $discussion): bool
    {
        if ($discussion->source_comment_id && ! Comment::query()->whereKey($discussion->source_comment_id)->where('status', 'visible')->exists()) {
            return false;
        }
        if ($discussion->is_public) {
            return $discussion->lesson_id === null;
        }
        if (! $user || ! $discussion->course) {
            return false;
        }
        if ($this->canModerate($user, $discussion->course)) {
            return true;
        }
        if (! $user->student) {
            return false;
        }
        $enrollments = $user->student->enrollments()->where('is_active', true)
            ->whereHas('plan.space', fn ($query) => $query->where('course_id', $discussion->course_id))
            ->with('plan.space')->get();
        $planIds = $discussion->plans()->pluck('plans.id');
        if ($planIds->isNotEmpty()) {
            $enrollments = $enrollments->whereIn('plan_id', $planIds);
        }
        if ($discussion->lesson_id) {
            return $enrollments->contains(fn ($enrollment): bool => app(StudyService::class)
                ->canViewLessonCommunity($user, $enrollment->plan->space, $discussion->lesson));
        }

        return $enrollments->isNotEmpty();
    }

    public function target(string $type, ?int $id, ?int $spaceId, ?User $user): ?Model
    {
        if ($type === 'site') {
            return null;
        }
        if ($type === 'course') {
            return Course::query()->where('is_published', true)->findOrFail($id);
        }
        if ($type === 'lesson') {
            $lesson = Lesson::query()->with('section.course')->findOrFail($id);
            $space = Space::query()->findOrFail($spaceId);
            abort_unless($user && $space->course_id === $lesson->section->course_id, 404);
            app(StudyService::class)->authorizeLessonCommunity($user, $space, $lesson);

            return $lesson;
        }
        if ($type === 'discussion') {
            $discussion = Discussion::query()->with(['course', 'lesson'])->findOrFail($id);
            abort_unless($this->canViewDiscussion($user, $discussion), 404);

            return $discussion;
        }
        abort(404);
    }

    public function courseFor(?Model $target): ?Course
    {
        return match (true) {
            $target instanceof Course => $target,
            $target instanceof Lesson => $target->section->course,
            $target instanceof Discussion => $target->course,
            default => null,
        };
    }

    /** @return list<array<string, mixed>> */
    public function comments(?Model $target, ?User $user): array
    {
        $query = Comment::query()->with('author:id,name')->where('status', 'visible');
        if ($target) {
            $query->where('commentable_type', $target::class)->where('commentable_id', $target->getKey());
        } else {
            $query->whereNull('commentable_type')->whereNull('commentable_id');
        }
        $comments = $query->orderBy('id')->get();
        $discussionIds = Discussion::query()->whereIn('source_comment_id', $comments->modelKeys())
            ->with(['course', 'lesson'])->get()->filter(fn (Discussion $discussion): bool => $this->canViewDiscussion($user, $discussion))
            ->keyBy('source_comment_id');
        $canModerate = $this->canModerate($user, $this->courseFor($target));

        return $this->commentTree($comments, null, $user, $canModerate, $discussionIds);
    }

    /** @return list<array<string, mixed>> */
    private function commentTree(Collection $comments, ?int $parent, ?User $user, bool $canModerate, Collection $discussions): array
    {
        return $comments->where('replay_id', $parent)->map(fn (Comment $comment): array => [
            'id' => $comment->id,
            'body' => $comment->body,
            'author' => $comment->author?->name ?? 'کاربر',
            'createdAt' => $comment->created_at?->toISOString(),
            'canModerate' => $canModerate,
            'canConvert' => $user !== null && ($canModerate || $user->id === $comment->user_id),
            'discussionId' => $discussions->get($comment->id)?->id,
            'discussionUrl' => $discussions->get($comment->id)?->url(),
            'replies' => $this->commentTree($comments, $comment->id, $user, $canModerate, $discussions),
        ])->values()->all();
    }
}
