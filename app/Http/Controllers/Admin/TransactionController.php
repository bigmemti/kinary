<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTransactionRequest;
use App\Http\Requests\Admin\UpdateTransactionRequest;
use App\Models\Transaction;
use App\Models\Wallet;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/transaction/index', [
            'transactions' => Transaction::with(['wallet.user', 'ledger'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/transaction/create', [
            'wallets' => Wallet::with('user')->get(),
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
            'transaction' => $transaction->load(['wallet.user', 'ledger']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        return inertia('admin/transaction/edit', [
            'wallets' => Wallet::with('user')->get(),
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
