<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Plan extends Model
{
    /** @use HasFactory<\Database\Factories\PlanFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'course_id',
        'name',
        'price',
    ];

    public function course(){
        return $this->belongsTo(Course::class);
    }

    public function students(){
        return $this->belongsToMany(Student::class, Enrollment::class)->withPivot(['id'])->withTimestamps();
    }

    public function enrollments(){
        return $this->hasMany(Enrollment::class);
    }

    public function orders(){
        return $this->belongsToMany(Order::class);
    }

    public function buy(string $authority){
        return Transaction::create([
            'user_id' => auth()->user()->id,
            'plan_id' => $this->id,
            'amount' => $this->price,
            'gateway' => 'zarinpal',
            'authority' => $authority,
        ]);
    }
}
