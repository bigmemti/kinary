<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoContent extends Model
{
    protected $fillable = ['name', 'path'];

    public static function embedSource(string $markup): ?string
    {
        $document = new \DOMDocument;
        $previous = libxml_use_internal_errors(true);
        try {
            $document->loadHTML($markup, LIBXML_NONET);
            $frames = $document->getElementsByTagName('iframe');
            $source = $frames->length === 1 ? $frames->item(0)->getAttribute('src') : '';
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }

        return filter_var($source, FILTER_VALIDATE_URL) && preg_match('~^https?://~i', $source) && strlen($source) <= 249 ? $source : null;
    }
}
