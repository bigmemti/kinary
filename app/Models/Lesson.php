<?php

namespace App\Models;

use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    ];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function contents()
    {
        return $this->hasMany(Content::class);
    }
}
