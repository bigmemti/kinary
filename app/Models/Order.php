<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'wallet_id',
        'status',
    ];

    public function plans()
    {
        return $this->belongsToMany(Plan::class)->withTimestamps();
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }
}
