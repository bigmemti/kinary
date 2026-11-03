<?php

namespace App\Models;

use Database\Factories\SpaceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Fillable(['course_id', 'name', 'quiz_id'])]
class Space extends Model
{
    /** @use HasFactory<SpaceFactory> */
    use HasFactory;

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function deletionBlockReason(): ?string
    {
        if ($this->plans()->exists()) {
            return 'ابتدا پلن‌های این اسپیس را حذف کنید.';
        }

        if (Quiz::query()->where('space_id', $this->id)->exists()) {
            return 'این اسپیس دارای آزمون است و قابل حذف نیست.';
        }

        foreach (['requirements', 'category_space', 'grades', 'learning_nodes', 'questions'] as $table) {
            if (DB::table($table)->where('space_id', $this->id)->exists()) {
                return 'این اسپیس در آزمون، پیش‌نیاز، دسته‌بندی یا مسیر یادگیری استفاده شده است.';
            }
        }

        return null;
    }
}
