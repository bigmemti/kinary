<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attempt extends Model
{
    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'expires_at' => 'datetime', 'finished_at' => 'datetime', 'score' => 'decimal:2'];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }
}
