<?php

namespace App\Models;

use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    /** @use HasFactory<\Database\Factories\CourseFactory> */
    use HasFactory, Sluggable, SoftDeletes;
    
    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'title',
                'onUpdate' => false,
                'includeTrashed' => true,
            ]
        ];
    }

    protected $fillable = [
        'title',
        'slug',
        'description',
        'thumbnail',
        'intro_video_url',
        'status',
    ];
}
