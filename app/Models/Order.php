<?php

namespace App\Models;

class Order extends Model
{
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
