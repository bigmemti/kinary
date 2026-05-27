<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderTransactionRequest;
use App\Models\Order;

class OrderTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Order $order)
    {
        return inertia('admin/order/transaction/index', [
            'order' => $order->load(['transactions']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Order $order)
    {
        return inertia('admin/order/transaction/create', [
            'order' => $order->loadSum('plans as amount', 'price'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderTransactionRequest $request, Order $order)
    {
        $order->transactions()->create([...$request->validated(), 'authority' => 'jlaskdjf']);
    }
}
