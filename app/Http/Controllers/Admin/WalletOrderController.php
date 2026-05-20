<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWalletOrderRequest;
use App\Models\Wallet;

class WalletOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Wallet $wallet)
    {
        return inertia('admin/wallet/order/index', [
            'wallet' => $wallet->load(['user',  'orders' => fn($query) => $query->withCount(['plans', 'transactions'])->withSum('plans as amount', 'price')]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Wallet $wallet)
    {
        return inertia('admin/wallet/order/create', [
            'wallet' => $wallet->load(['user']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWalletOrderRequest $request, Wallet $wallet)
    {
        $wallet->orders()->create($request->validated());

        return to_route('admin.wallet.order.index', ['wallet' => $wallet]);
    }
}
