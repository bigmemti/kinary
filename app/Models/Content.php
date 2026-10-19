<?php

namespace App\Models;

use Database\Factories\ContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\DB;

class Content extends Model
{
    /** @use HasFactory<ContentFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lesson_id',
        'description',
        'order',
        'contentable_type',
        'contentable_id',
    ];

    protected function casts(): array
    {
        return ['order' => 'integer'];
    }

    public function contentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function accesses(): HasMany
    {
        return $this->hasMany(Access::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function deletionBlockReason(): ?string
    {
        if (DB::table('progress')->where('content_id', $this->id)->exists()) {
            return 'این محتوا پیشرفت دانشجو دارد و حذف نمی‌شود.';
        }

        if (RemindContent::query()->where('content_id', $this->id)->exists()) {
            return 'ابتدا یادآوری‌هایی که به این محتوا اشاره می‌کنند را تغییر دهید.';
        }

        return null;
    }
}
