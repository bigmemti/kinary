<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Content extends Model
{
    /** @use HasFactory<\Database\Factories\ContentFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lesson_id',
    ];

    public function lesson(){
        return $this->belongsTo(Lesson::class);
    }

}
