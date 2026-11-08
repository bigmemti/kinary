<?php

namespace App\Models;

use App\Services\SlugFormatter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Discussion extends Model
{
    protected $fillable = ['user_id', 'course_id', 'lesson_id', 'source_comment_id', 'name', 'body', 'is_public'];

    public function slug(): string
    {
        return rtrim(mb_substr(app(SlugFormatter::class)->format($this->name), 0, 80), '-') ?: 'item';
    }

    public function url(): string
    {
        return route('community.show', ['discussion' => $this->id, 'slug' => $this->slug()]);
    }

    protected function casts(): array
    {
        return ['is_public' => 'boolean'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function plans(): BelongsToMany
    {
        return $this->belongsToMany(Plan::class);
    }
}
