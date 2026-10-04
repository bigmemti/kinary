<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['course_id', 'name'])]
class Space extends Model
{
    public function plans()
    {
        return $this->hasMany(Plan::class);
    }

    public function course(){
        return $this->belongsTo(Course::class);
    }
}
