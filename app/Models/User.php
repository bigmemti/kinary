<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Services\ActivityLogger;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function transactions(): HasManyThrough
    {
        return $this->hasManyThrough(Transaction::class, Wallet::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function updateOrders()
    {
        DB::transaction(function (): void {
            $expired = $this->wallet->orders()->where('status', 'pending')->where('updated_at', '<', now()->subHours(24))->lockForUpdate()->orderBy('id')->get(['id', 'status']);
            if ($expired->isEmpty()) {
                return;
            }
            $this->wallet->orders()->whereIn('id', $expired->modelKeys())->update(['status' => 'expired']);
            $after = $this->wallet->orders()->whereIn('id', $expired->modelKeys())->orderBy('id')->get(['id', 'status'])->toArray();
            app(ActivityLogger::class)->recordChanges('orders.expired', $expired->toArray(), $after, $this);
        });
    }

    public function hasActiveCart()
    {
        $this->updateOrders();

        return $this->wallet->orders()->where('status', 'pending')->count() > 0;
    }

    public function activeCart()
    {
        $this->updateOrders();

        return $this->wallet->orders()->where('status', 'pending')->first();
    }

    public function cartItemsCount()
    {
        if ($this->hasActiveCart()) {
            return $this->activeCart()->plans()->count();
        }

        return 0;
    }
}
