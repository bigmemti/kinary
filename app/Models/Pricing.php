<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pricing extends Model
{
    protected $fillable = ['plan_id', 'lesson_id', 'price'];

    protected function casts(): array
    {
        return ['price' => 'integer'];
    }
}
