<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionFactory> */
    use HasFactory;

    protected $fillable=[
        'user_id',
        'plan_id',
        'amount',
        'gateway',
        'authority',
        'status',
        'paid_at',
    ];
    
    public function user(){
        return $this->belongsTo(User::class);
    }
    
    public function plan(){
        return $this->belongsTo(Plan::class);
    }
}
