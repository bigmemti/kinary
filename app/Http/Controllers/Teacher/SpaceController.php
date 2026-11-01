<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreSpaceRequest;
use App\Http\Requests\Teacher\UpdateSpaceRequest;
use App\Models\Category;
use App\Models\Course;
use App\Models\Space;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class SpaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course): Response
    {
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/course/space/index', [
            'course' => $course->load(['spaces' => fn ($query) => $query->withCount(['plans'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course): Response
    {
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/course/space/create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSpaceRequest $request, Course $course): RedirectResponse
    {
        abort_unless($course, 404);
        $item = DB::transaction(function () use ($request, $course): Space {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('manageEditorCommerce', $course);
            $data = $request->validated();

            $space = $course->spaces()->create(collect($data)->except(['category_ids', 'new_category'])->all());
            $this->syncCategories($space, $data);

            return $space;
        });

        return to_route('teacher.course.editor', $course)->with('editor_created', ['kind' => 'space', 'id' => $item->id, 'parent_id' => $course->id]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Space $space): Response
    {
        $course = $space->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/space/show', [
            'space' => $space->loadCount(['plans'])->load(['plans']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Space $space): Response
    {
        $course = $space->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/space/edit', [
            'space' => $space,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSpaceRequest $request, Space $space): RedirectResponse
    {
        $course = $space->course;
        abort_unless($course, 404);
        DB::transaction(function () use ($request, $space, $course): void {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('manageEditorCommerce', $course);
            $data = $request->validated();
            $space->update(collect($data)->except(['category_ids', 'new_category'])->all());
            $this->syncCategories($space, $data);
        });

        return to_route('teacher.course.editor', $course);
    }

    /** @param array<string, mixed> $data */
    private function syncCategories(Space $space, array $data): void
    {
        if (! array_key_exists('category_ids', $data) && empty($data['new_category'])) {
            return;
        }

        $ids = $data['category_ids'] ?? $space->categories()->pluck('categories.id')->all();
        if (! empty($data['new_category'])) {
            $category = new Category;
            $category->name = $data['new_category'];
            $category->save();
            $ids[] = $category->id;
        }
        $space->categories()->sync($ids);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Space $space): RedirectResponse
    {
        $course = $space->course;
        abort_unless($course, 404);
        Gate::authorize('manageEditorCommerce', $course);
        DB::transaction(function () use ($space, $course): void {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('manageEditorCommerce', $course);
            $space->refresh();
            if ($reason = $space->deletionBlockReason()) {
                throw ValidationException::withMessages(['delete' => $reason]);
            }
            $space->delete();
        });

        return to_route('teacher.course.editor', $course);
    }
}
