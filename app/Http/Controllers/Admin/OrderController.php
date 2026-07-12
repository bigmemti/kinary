<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderRequest;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Wallet;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/order/index', [
            'orders' => Order::with(['wallet.user'])->withCount(['plans', 'transactions'])->withSum('plans as amount', 'price')->latest()->get(),
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
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        return inertia('admin/order/show', [
            'order' => $order->load(['wallet.user', 'plans.course.teacher.user', 'transactions'])->loadCount(['plans', 'transactions'])->loadSum('plans as amount', 'price'),
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
        $order->plans()->syncWithPivotValues($request->plans, ['updated_at' => now()]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->plans()->detach();
        $order->delete();
    }
}
