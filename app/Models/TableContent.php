<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TableContent extends Model
{
    protected $fillable = ['table'];

    protected function casts(): array
    {
        return ['table' => 'array'];
    }
}
