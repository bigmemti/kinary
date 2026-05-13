<?php

namespace App\Models;

class Lesson extends Model
{
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
