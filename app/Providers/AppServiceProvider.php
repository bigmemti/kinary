<?php

namespace App\Providers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Observers\StudentObserver;
use App\Observers\TeacherObserver;
use App\Observers\UserObserver;
use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\PasswordResetLinkSent;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;
use Laravel\Fortify\Events\TwoFactorAuthenticationEnabled;
use Laravel\Fortify\Events\TwoFactorAuthenticationFailed;
use Spatie\Permission\Events\PermissionAttachedEvent;
use Spatie\Permission\Events\PermissionDetachedEvent;
use Spatie\Permission\Events\RoleAttachedEvent;
use Spatie\Permission\Events\RoleDetachedEvent;

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
        foreach (['created', 'updated', 'deleted', 'restored'] as $event) {
            Event::listen('eloquent.'.$event.': *', function (string $name, array $models) use ($event): void {
                app(ActivityLogger::class)->modelChanged($event, $models[0]);
            });
        }

        Event::listen(Login::class, function (Login $event): void {
            app(ActivityLogger::class)->record('auth.login', actorId: $event->user->getAuthIdentifier());
        });
        Event::listen(Failed::class, function (Failed $event): void {
            $username = $event->credentials[config('fortify.username', 'email')] ?? null;
            app(ActivityLogger::class)->record('auth.login', 'failure', ['username' => is_string($username) ? mb_substr($username, 0, 255) : null]);
        });
        Event::listen(Logout::class, function (Logout $event): void {
            app(ActivityLogger::class)->record('auth.logout', actorId: $event->user?->getAuthIdentifier());
        });

        foreach ([RoleAttachedEvent::class => 'role.attach.requested', RoleDetachedEvent::class => 'role.detach.requested', PermissionAttachedEvent::class => 'permission.attach.requested', PermissionDetachedEvent::class => 'permission.detach.requested'] as $eventClass => $name) {
            Event::listen($eventClass, function ($event) use ($name): void {
                $values = $event->rolesOrIds ?? $event->permissionsOrIds;
                $ids = collect(is_iterable($values) ? $values : [$values])->map(fn ($value) => $value instanceof Model ? $value->getKey() : $value)->values()->all();
                $relation = str_starts_with($name, 'role.') ? 'roles' : 'permissions';
                $current = [];
                if ($event->model->exists) {
                    $query = $event->model->{$relation}();
                    $current = $query->pluck($query->getRelated()->getQualifiedKeyName())->all();
                }
                app(ActivityLogger::class)->record($name, properties: ['ids' => $ids, 'current_ids' => $current], subject: $event->model);
            });
        }

        foreach ([TwoFactorAuthenticationEnabled::class => 'auth.two_factor.enabled', TwoFactorAuthenticationConfirmed::class => 'auth.two_factor.confirmed', TwoFactorAuthenticationDisabled::class => 'auth.two_factor.disabled', TwoFactorAuthenticationFailed::class => 'auth.two_factor.failed', PasswordReset::class => 'auth.password.reset', PasswordResetLinkSent::class => 'auth.password.reset_link_sent'] as $eventClass => $name) {
            Event::listen($eventClass, function ($event) use ($name): void {
                app(ActivityLogger::class)->record($name, $name === 'auth.two_factor.failed' ? 'failure' : 'success', subject: $event->user);
            });
        }
        Event::listen(Lockout::class, function (Lockout $event): void {
            $username = $event->request->input(config('fortify.username', 'email'));
            app(ActivityLogger::class)->record('auth.lockout', 'failure', ['username' => is_string($username) ? mb_substr($username, 0, 255) : null]);
        });

        User::observe(UserObserver::class);
        Student::observe(StudentObserver::class);
        Teacher::observe(TeacherObserver::class);

        Route::macro('softDeletableResource', function ($name, $controller, $options = []) {
            Route::resource($name, $controller, $options);
            Route::post("$name/{{$name}}/restore", [$controller, 'restore']);
            Route::delete("$name/{{$name}}/fore-delete", [$controller, 'foreDelete']);
        });
    }
}
