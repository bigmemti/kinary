<?php

namespace App\Models;

use App\Enums\CourseStatus;
use Cviebrock\EloquentSluggable\Sluggable;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory, Sluggable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'teacher_id',
        'title',
        'slug',
        'description',
        'thumbnail',
        'intro_video_url',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CourseStatus::class,
        ];
    }

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'title',
                'onUpdate' => false,
                'includeTrashed' => true,
            ],
        ];
    }

    public function plans()
    {
        return $this->hasMany(Plan::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
