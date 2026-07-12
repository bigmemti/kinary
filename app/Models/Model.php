<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model as ModelEloquent;

class Model extends ModelEloquent
{
    public static function takeInRandomOrder(?int $take = null, $seed = '')
    {
        return self::inRandomOrder($seed)->take($take);
    }

    public static function getInRandomOrder(?int $take = null, $columns = ['*'], $seed = '')
    {
        return self::takeInRandomOrder($take, $seed)->get($columns);
    }

    public static function pluckInRandomOrder(?int $take = null, $columns = ['*'], $seed = '')
    {
        return self::takeInRandomOrder($take, $seed)->pluck($columns);
    }
}
