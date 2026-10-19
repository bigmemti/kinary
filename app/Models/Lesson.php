<?php

namespace App\Models;

use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'section_id',
        'name',
        'order',
        'thumbnail',
        'images',
    ];

    protected function casts(): array
    {
        return ['images' => 'array', 'order' => 'integer'];
    }

    public function pricings(): HasMany
    {
        return $this->hasMany(Pricing::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function contents()
    {
        return $this->hasMany(Content::class);
    }
}
