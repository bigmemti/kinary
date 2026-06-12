<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Plan;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Plan $plan)
    {
        return inertia('teacher/plan/enrollment/index', [
            'plan' => $plan->load([
                'students.user',
            ]),
        ]);
    }
}
