<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    protected function casts(): array
    {
        return ['space_id' => 'integer', 'duration_seconds' => 'integer', 'guest_attempt_limit' => 'integer'];
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class)->withPivot('order')->withTimestamps()->orderByPivot('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(Attempt::class);
    }
}
