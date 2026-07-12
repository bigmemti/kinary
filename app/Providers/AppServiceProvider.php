<?php

namespace App\Providers;

use App\Models\User;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(UserObserver::class);

        Route::macro('softDeletableResource', function ($name, $controller, $options = []) {
            Route::resource($name, $controller, $options);
            Route::post("$name/{{$name}}/restore", [$controller, 'restore']);
            Route::delete("$name/{{$name}}/fore-delete", [$controller, 'foreDelete']);
        });
    }
}
