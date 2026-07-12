<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTransactionRequest;
use App\Http\Requests\Admin\UpdateTransactionRequest;
use App\Models\Order;
use App\Models\Transaction;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/transaction/index', [
            'transactions' => Transaction::with(['order' => fn ($query) => $query->with(['wallet.user'])->withSum('plans as amount', 'price')])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/transaction/create', [
            'orders' => Order::withSum('plans as amount', 'price')->with('wallet.user')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        Transaction::create([...$request->validated(), 'authority' => 'jlaskdjf']);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        return inertia('admin/transaction/show', [
            'transaction' => $transaction->load(['order' => fn ($query) => $query->with(['wallet.user'])->withSum('plans as amount', 'price')]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        return inertia('admin/transaction/edit', [
            'orders' => Order::withSum('plans as amount', 'price')->with('wallet.user')->get(),
            'transaction' => $transaction,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        $transaction->update($request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
    }
}
