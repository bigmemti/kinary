<?php

namespace App\Models;

class Section extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'course_id',
    ];

    public function course(){
        return $this->belongsTo(Course::class);
    }
}
