<?php

namespace App\Models;

use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Plan extends Model
{
    /** @use HasFactory<PlanFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'space_id',
        'name',
        'price',
        'order',
    ];

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    protected function casts(): array
    {
        return ['price' => 'integer', 'order' => 'integer'];
    }

    public function deletionBlockReason(): ?string
    {
        if ($this->enrollments()->exists() || $this->orders()->exists()) {
            return 'پلن دارای ثبت‌نام یا سابقه سفارش قابل حذف نیست.';
        }

        if (DB::table('accesses')->where('plan_id', $this->id)->exists()) {
            return 'این پلن در دسترسی محتوا استفاده شده است.';
        }

        return null;
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, Enrollment::class)->withPivot(['id'])->withTimestamps();
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class);
    }
}
