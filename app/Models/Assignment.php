<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected function casts(): array
    {
        return ['allowed_extensions' => 'array'];
    }
}
