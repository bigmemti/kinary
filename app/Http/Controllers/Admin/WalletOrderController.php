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
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Wallet $wallet)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWalletOrderRequest $request, Wallet $wallet)
    {
        //
    }
}
