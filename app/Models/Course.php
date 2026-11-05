<?php

namespace App\Models;

use App\Enums\TeacherRole;
use App\Services\SlugFormatter;
use Cviebrock\EloquentSluggable\Sluggable;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\Pivot;

class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory, Sluggable;

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
                'maxLength' => 200,
                'method' => [app(SlugFormatter::class), 'format'],
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

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(Teacher::class)->withPivot('role')->withTimestamps();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['is_published' => 'boolean'];
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

    public static function published()
    {
        return self::where('is_published', true);
    }
}
