<?php

namespace App\Models;

class Wallet extends Model
{
    public function orders(){
        return $this->hasMany(Order::class);
    }
}
