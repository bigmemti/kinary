<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWalletRequest;
use App\Http\Requests\Admin\UpdateWalletRequest;
use App\Models\User;
use App\Models\Wallet;

class WalletController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/wallet/index', [
            'wallets' => ($meta = Wallet::with(['user'])->withCount('orders')->paginate(10)->toArray())['data'],
            'meta' => $meta,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/wallet/create', [
            'users' => User::doesntHave('wallet')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWalletRequest $request)
    {
        Wallet::create($request->validated());

        return to_route('admin.wallet.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Wallet $wallet)
    {
        return inertia('admin/wallet/show', [
            'wallet' => $wallet->load([
                'user',
                'orders' => fn ($query) => $query
                                                // ->with(['plans.course.teacher.user', 'transactions'])
                    ->withCount(['plans', 'transactions'])
                    ->withSum('plans as amount', 'price')]
            )->loadCount('orders'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Wallet $wallet)
    {
        return inertia('admin/wallet/edit', [
            'users' => [...User::doesntHave('wallet')->get(), $wallet->user],
            'wallet' => $wallet->load('user'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWalletRequest $request, Wallet $wallet)
    {
        $wallet->update($request->validated());

        return to_route('admin.wallet.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Wallet $wallet)
    {
        $wallet->delete();
    }
}
