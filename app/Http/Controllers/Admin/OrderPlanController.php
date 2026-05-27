<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;

class OrderPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Order $order)
    {
        return inertia('admin/order/plan/index', [
            'order' => $order->load(['plans' => fn($query) => $query->with(['course.teacher.user'])->withCount(['orders', 'students'])]),
        ]);
    }
}
