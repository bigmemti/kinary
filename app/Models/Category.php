<?php

namespace App\Models;

use App\Services\SlugFormatter;
use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    use Sluggable;

    protected $fillable = ['name', 'slug', 'description'];

    public function spaces(): BelongsToMany
    {
        return $this->belongsToMany(Space::class);
    }

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'name',
                'onUpdate' => false,
                'maxLength' => 200,
                'method' => [app(SlugFormatter::class), 'format'],
            ],
        ];
    }
}
