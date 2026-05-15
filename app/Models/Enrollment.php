<?php

namespace App\Models;

class Enrollment extends Model
{
    public function student(){
        return $this->belongsTo(Student::class);
    }

    public function plan(){
        return $this->belongsTo(Plan::class);
    }
}
