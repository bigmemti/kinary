<?php

namespace App\Models;

use App\Models\Model;

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
