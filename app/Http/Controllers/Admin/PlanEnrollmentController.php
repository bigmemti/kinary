<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;

class PlanEnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Plan $plan)
    {
        return inertia('admin/plan/enrollment/index', [
            'plan' => $plan->load([
                'students.user',
            ]),
        ]);
    }
}
