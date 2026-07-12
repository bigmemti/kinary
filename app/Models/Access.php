<?php

namespace App\Models;

use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Access extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'plan_id',
        'content_id',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function requirements()
    {
        return $this->hasMany(Requirement::class);
    }
}
