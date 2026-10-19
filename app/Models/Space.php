<?php

namespace App\Models;

use Database\Factories\SpaceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Fillable(['course_id', 'name', 'quiz_id'])]
class Space extends Model
{
    /** @use HasFactory<SpaceFactory> */
    use HasFactory;

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
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

        foreach (['requirements', 'category_space', 'grades', 'learning_nodes', 'questions'] as $table) {
            if (DB::table($table)->where('space_id', $this->id)->exists()) {
                return 'این اسپیس در آزمون، پیش‌نیاز، دسته‌بندی یا مسیر یادگیری استفاده شده است.';
            }
        }

        return null;
    }
}
