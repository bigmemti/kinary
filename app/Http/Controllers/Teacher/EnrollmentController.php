<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Support\Facades\Gate;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Plan $plan)
    {
        Gate::authorize('viewEditor', $plan->space->course);

        return inertia('teacher/plan/enrollment/index', [
            'plan' => $plan->load([
                'students.user',
            ]),
        ]);
    }
}
