<?php

namespace App\Models;

class Enrollment extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_id',
        'plan_id',
    ];

    public function student(){
        return $this->belongsTo(Student::class);
    }

    public function plan(){
        return $this->belongsTo(Plan::class);
    }
}
