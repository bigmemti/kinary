<?php

namespace App\Models;

use App\Enums\TeacherRole;
use Database\Factories\TeacherFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Teacher extends Model
{
    /** @use HasFactory<TeacherFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class)->withPivot('role')->withTimestamps();
    }

    public static function ownerOrInstructor()
    {
        return self::whereHas('courses', fn (Builder $query): Builder => $query->where('is_published', true)
            ->whereIn('course_teacher.role', [TeacherRole::Owner, TeacherRole::Instructor]));
    }
}
