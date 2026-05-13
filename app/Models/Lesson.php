<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    /** @use HasFactory<\Database\Factories\LessonFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'section_id',
    ];

    public function section(){
        return $this->belongsTo(Section::class);
    }
}
