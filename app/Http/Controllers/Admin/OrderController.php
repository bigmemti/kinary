<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderRequest;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Wallet;
use App\Services\ActivityLogger;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/order/index', [
            'orders' => Order::with(['wallet.user'])->withCount(['plans'])->withSum('plans as amount', 'price')->latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/order/create', [
            'wallets' => Wallet::with(['user'])->get(),
            'plans' => Plan::with(['course.teacher.user'])->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $order = Order::create($request->validated());

        if ($request->has('plans')) {
            $order->plans()->sync($request->plans);
            $logger = app(ActivityLogger::class);
            $logger->recordChanges('order.plans.changed', [], $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']), $order);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        return inertia('admin/order/show', [
            'order' => $order->load(['wallet.user', 'plans.course.teacher.user'])->loadCount(['plans'])->loadSum('plans as amount', 'price'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        return inertia('admin/order/edit', [
            'wallets' => Wallet::with(['user'])->get(),
            'plans' => Plan::with(['course.teacher.user'])->get(),
            'order' => $order->load(['plans' => fn ($query) => $query->pluck('id')]),
        ]);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $order->update($request->validated());
        $logger = app(ActivityLogger::class);
        $before = $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']);
        $order->plans()->syncWithPivotValues($request->plans, ['updated_at' => now()]);
        $logger->recordChanges('order.plans.changed', $before, $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']), $order);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $logger = app(ActivityLogger::class);
        $before = $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']);
        $order->plans()->detach();
        $logger->recordChanges('order.plans.changed', $before, [], $order);
        $order->delete();
    }
}
