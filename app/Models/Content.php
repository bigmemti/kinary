<?php

namespace App\Models;

use Database\Factories\ContentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'body',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
