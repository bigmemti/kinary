<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RemindContent extends Model
{
    protected $fillable = ['content_id'];

    public function target()
    {
        return $this->belongsTo(Content::class, 'content_id');
    }
}
