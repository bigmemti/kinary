<?php

namespace App\Models;

use App\Enums\TeacherRole;
use Cviebrock\EloquentSluggable\Sluggable;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\Pivot;
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
        'title',
        'slug',
        'description',
        'thumbnail',
        'intro_video_url',
        'is_published',
    ];

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

    public function spaces()
    {
        return $this->hasMany(Space::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class);
    }

    public function teacher(): HasOneThrough
    {
        return $this->newHasOneThrough(
            Teacher::query(),
            $this,
            (new Pivot)->setTable('course_teacher'),
            'course_id',
            'id',
            'id',
            'teacher_id',
        )->where('course_teacher.role', TeacherRole::Owner);
    }
}
