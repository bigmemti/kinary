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
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Order $order)
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderTransactionRequest $request, Order $order)
    {
        //
    }
}
