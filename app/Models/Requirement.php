<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Requirement extends Model
{
    protected $fillable = ['access_id', 'space_id', 'score'];

    protected function casts(): array
    {
        return ['score' => 'integer'];
    }
}
