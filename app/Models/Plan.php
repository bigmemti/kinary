<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    /** @use HasFactory<\Database\Factories\PlanFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'name',
        'price',
    ];

    public function course(){
        return $this->belongsTo(Course::class);
    }

    public function users(){
        return $this->belongsToMany(Plan::class);
    }
}
