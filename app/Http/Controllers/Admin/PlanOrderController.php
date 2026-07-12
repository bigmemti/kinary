<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;

class PlanOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Plan $plan)
    {
        return inertia('admin/plan/order/index', [
            'plan' => $plan->load([
                'orders' => fn ($query) => $query->with(['wallet.user'])->withCount(['transactions', 'plans'])->withSum('plans as amount', 'price'),
            ]),
        ]);
    }
}
