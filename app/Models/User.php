<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

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
    
    public function transactions(){
        return $this->hasMany(Transaction::class);
    }
    
    public function wallet(){
        return $this->hasOne(Wallet::class);
    }

    public function student(){
        return $this->hasOne(Student::class);
    }

    public function teacher(){
        return $this->hasOne(Teacher::class);
    }

    public function updateOrders() {
        $this->wallet->orders()->where('status', 'pending')->where('updated_at', '<', now()->subHours(24))->update(['status' => 'expired']);
    }

    public function hasActiveCart(){
        $this->updateOrders();
        return $this->wallet->orders()->where('status', 'pending')->count() > 0;
    }

    public function activeCart(){
        $this->updateOrders();
        return $this->wallet->orders()->where('status', 'pending')->first();
    }

    public function cartItemsCount(){
        if($this->hasActiveCart())
            return $this->activeCart()->plans()->count();
        return 0;
    }
}
