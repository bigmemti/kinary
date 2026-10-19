<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StorePlanRequest;
use App\Http\Requests\Teacher\UpdatePlanRequest;
use App\Models\Course;
use App\Models\Plan;
use App\Models\Space;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Space $space): Response
    {
        $course = $space->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/space/plan/index', [
            'space' => $space->load(['plans' => fn ($query) => $query->withCount(['enrollments'])]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Space $space): Response
    {
        $course = $space->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/space/plan/create', [
            'space' => $space,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlanRequest $request, Space $space): RedirectResponse
    {
        $course = $space->course;
        abort_unless($course, 404);
        $item = DB::transaction(function () use ($request, $space, $course): Plan {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('manageEditorCommerce', $course);
            $data = $request->validated();
            $data['order'] = (int) $space->plans()->max('order') + 1;
            if ($data['order'] > 32767) {
                throw ValidationException::withMessages(['order' => 'حداکثر ترتیب مجاز پر شده است.']);
            }

            return $space->plans()->create($data);
        });

        return to_route('teacher.course.editor', $course)->with('editor_created', ['kind' => 'plan', 'id' => $item->id, 'parent_id' => $space->id]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan): Response
    {
        $course = $plan->space?->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/plan/show', [
            'plan' => $plan->loadCount(['enrollments']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan $plan): Response
    {
        $course = $plan->space?->course;
        abort_unless($course, 404);
        Gate::authorize('viewEditor', $course);

        return inertia('teacher/plan/edit', [
            'plan' => $plan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlanRequest $request, Plan $plan): RedirectResponse
    {
        $course = $plan->space?->course;
        abort_unless($course, 404);
        DB::transaction(function () use ($request, $plan, $course): void {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('manageEditorCommerce', $course);
            $plan->update($request->validated());
        });

        return to_route('teacher.course.editor', $course);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan $plan): RedirectResponse
    {
        $course = $plan->space?->course;
        abort_unless($course, 404);
        Gate::authorize('manageEditorCommerce', $course);
        DB::transaction(function () use ($plan, $course): void {
            Course::query()->whereKey($course->id)->lockForUpdate()->firstOrFail();
            Gate::authorize('manageEditorCommerce', $course);
            $plan->refresh();
            if ($reason = $plan->deletionBlockReason()) {
                throw ValidationException::withMessages(['delete' => $reason]);
            }
            DB::table('pricings')->where('plan_id', $plan->id)->delete();
            $plan->delete();
        });

        return to_route('teacher.course.editor', $course);
    }
}
