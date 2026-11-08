<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\Course;
use App\Services\CommunityService;
use App\Services\CoursePageService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate(['search' => ['nullable', 'string', 'max:150']], [
            'search.string' => 'عبارت جستجو باید متن باشد.',
            'search.max' => 'عبارت جستجو نباید بیشتر از ۱۵۰ نویسه باشد.',
        ]);
        $search = trim($validated['search'] ?? '');

        return Inertia::render('course/catalog', [
            'canonicalUrl' => route('course.index'),
            'search' => $search,
            'courses' => Course::query()
                ->select(['id', 'title', 'slug', 'description', 'thumbnail'])
                ->where('is_published', true)
                ->when($search !== '', fn (Builder $query): Builder => $query
                    ->where(fn (Builder $query): Builder => $query
                        ->whereLike('title', '%'.$search.'%')
                        ->orWhereLike('description', '%'.$search.'%')))
                ->with('teacher.user:id,name')
                ->latest('created_at')->orderByDesc('id')
                ->paginate(12)->withQueryString(),
        ])->withViewData([
            'storefrontTitle' => 'همه دوره‌ها | آکادمی',
            'storefrontDescription' => 'دوره‌های آکادمی را ببینید و با جستجوی عنوان یا موضوع، آموزش موردنظرتان را پیدا کنید.',
        ]);
    }

    public function show(Request $request, Course $course, CoursePageService $coursePage): Response
    {
        abort_unless($course->is_published, 404);
        $targetId = $request->validate(['reminder' => ['nullable', 'integer']])['reminder'] ?? null;
        $target = $targetId ? Content::query()->whereKey($targetId)
            ->whereHas('lesson.section', fn (Builder $query): Builder => $query->where('course_id', $course->id))->first() : null;

        return Inertia::render('course/details', [
            ...$coursePage->data($course, $request->user()),
            'reminderPlanIds' => $target?->accesses()->pluck('plan_id')->all() ?? [],
            'canonicalUrl' => route('course.show', $course->slug),
            'comments' => app(CommunityService::class)->comments($course, $request->user()),
        ])->withViewData([
            'storefrontTitle' => $course->title.' | آکادمی',
            'storefrontDescription' => str($course->description ?? $course->title)->stripTags()->limit(160)->toString(),
        ]);
    }
}
