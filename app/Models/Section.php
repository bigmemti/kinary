<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Section extends Model
{
    /** @use HasFactory<\Database\Factories\SectionFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'course_id',
        'name',
    ];

    public function course(){
        return $this->belongsTo(Course::class);
    }

    public function lessons(){
        return $this->hasMany(Lesson::class);
    }
}
