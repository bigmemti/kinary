<?php

namespace App\Models;

use App\Enums\TransactionGateway;
use App\Enums\TransactionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable=[
        'user_id',
        'plan_id',
        'amount',
        'gateway',
        'authority',
        'status',
        'paid_at',
    ];
 
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gateway' => TransactionGateway::class,
            'status' => TransactionStatus::class,
        ];
    }

    public function order(){
        return $this->belongsTo(Order::class);
    }
}
