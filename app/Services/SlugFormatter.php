<?php

namespace App\Services;

class SlugFormatter
{
    public function format(string $value, string $separator = '-'): string
    {
        $value = str_replace(['ي', 'ك'], ['ی', 'ک'], mb_strtolower($value));
        $slug = trim(preg_replace('/[^\pL\pN]+/u', $separator, $value), $separator);

        return $slug !== '' ? $slug : 'item';
    }
}
