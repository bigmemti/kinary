<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'status',
    ];
    
    public function plans(){
        return $this->belongsToMany(Plan::class);
    }
    
    public function wallet(){
        return $this->belongsTo(Wallet::class);
    }
}
