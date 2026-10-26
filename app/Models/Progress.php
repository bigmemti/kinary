<?php

namespace App\Models;

use App\Enums\ProgressStatus;
use Illuminate\Database\Eloquent\Model;

class Progress extends Model
{
    protected $table = 'progress';

    protected $fillable = ['content_id', 'enrollment_id', 'status', 'read_at'];

    protected function casts(): array
    {
        return ['status' => ProgressStatus::class, 'read_at' => 'datetime'];
    }
}
