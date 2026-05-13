<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model as ModelEloquent;

class Model extends ModelEloquent{
    public static function getInRandomOrder(int|null $take = null, $columns = ['*'], $seed = ''){
        return self::inRandomOrder($seed)->take($take)->get($columns);
    }
}