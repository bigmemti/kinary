<?php

namespace App\Services;

use App\Enums\TeacherRole;
use App\Models\Content;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\Section;
use App\Models\Space;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoursePageService
{
    /**
     * @return array{course: array<string, mixed>, spaces: list<array<string, mixed>>}
     */
    public function data(Course $course, ?User $user = null): array
    {
        $course->load([
            'teachers.user:id,name',
            'spaces.categories:id,name,slug',
            'spaces.plans' => fn (HasMany $query): HasMany => $query->orderBy('order')->orderBy('id'),
            'sections' => fn (HasMany $query): HasMany => $query->orderBy('order')->orderBy('id'),
            'sections.lessons' => fn (HasMany $query): HasMany => $query->orderBy('order')->orderBy('id'),
            'sections.lessons.contents:id,lesson_id',
            'sections.lessons.contents.accesses:id,content_id,plan_id',
        ]);

        $enrolled = $user?->student?->plans()->wherePivot('is_active', true)->orderByDesc('order')->get();
        $cartItems = $user ? app(CartService::class)->items($user) : [];

        return [
            'course' => [
                ...$course->only(['id', 'title', 'slug', 'description', 'thumbnail']),
                'teachers' => $course->teachers
                    ->filter(fn (Teacher $teacher): bool => in_array($teacher->pivot->role, [TeacherRole::Owner->value, TeacherRole::Instructor->value], true))
                    ->map(fn (Teacher $teacher): array => ['id' => $teacher->id, 'name' => $teacher->user->name])
                    ->values()->all(),
            ],
            'spaces' => $course->spaces->sortBy('id')->map(fn (Space $space): array => $this->spaceData(
                $course, $space, $enrolled?->firstWhere('space_id', $space->id),
                collect($cartItems)->firstWhere('spaceId', $space->id)['id'] ?? null
            ))->values()->all(),
        ];
    }

    /**
     * @return array{id: int, name: string, sections: list<array<string, mixed>>, plans: list<array<string, mixed>>}
     */
    private function spaceData(Course $course, Space $space, ?Plan $current, ?int $cartPlanId): array
    {
        $planIds = $space->plans->modelKeys();
        $sections = $course->sections->map(function (Section $section) use ($space, $planIds): array {
            $lessons = $section->lessons->map(function (Lesson $lesson) use ($space, $planIds): array {
                $contents = $lesson->contents->filter(fn (Content $content): bool => $content->accesses->whereIn('plan_id', $planIds)->isNotEmpty());

                return [
                    'id' => $lesson->id,
                    'name' => $lesson->name,
                    'contentsCount' => $contents->count(),
                    'planAccess' => $space->plans->map(fn (Plan $plan): array => [
                        'planId' => $plan->id,
                        'planName' => $plan->name,
                        'contentsCount' => $contents->filter(fn (Content $content): bool => $content->accesses->contains('plan_id', $plan->id))->count(),
                    ])->all(),
                ];
            })->filter(fn (array $lesson): bool => $lesson['contentsCount'] > 0)->values();

            return ['id' => $section->id, 'parent_id' => $section->parent_id, 'name' => $section->name, 'lessons' => $lessons->all()];
        })->values();

        $lessonAccess = $sections->flatMap(fn (array $section): array => $section['lessons'])
            ->flatMap(fn (array $lesson): array => $lesson['planAccess']);

        return [
            'id' => $space->id,
            'name' => $space->name,
            'quizId' => $space->quiz_id,
            'categories' => $space->categories->map(fn ($category): array => $category->only(['id', 'name', 'slug']))->all(),
            'sections' => app(SectionTree::class)->visible($sections->all()),
            'plans' => $space->plans->map(function (Plan $plan) use ($lessonAccess, $current, $cartPlanId): array {
                $access = $lessonAccess->where('planId', $plan->id);
                $action = match (true) {
                    $current?->id === $plan->id => 'enrolled',
                    $current && $plan->order <= $current->order => 'unavailable',
                    $cartPlanId === $plan->id => 'remove',
                    $plan->price === 0 => 'enroll',
                    $cartPlanId !== null => 'replace',
                    $current !== null => 'upgrade',
                    default => 'add',
                };

                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => $plan->price,
                    'payablePrice' => max(0, $plan->price - ($current?->price ?? 0)),
                    'action' => $action,
                    'upgradeFrom' => $current?->name,
                    'contentsCount' => $access->sum('contentsCount'),
                    'lessonsCount' => $access->where('contentsCount', '>', 0)->count(),
                ];
            })->all(),
        ];
    }
}
