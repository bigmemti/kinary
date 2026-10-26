<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LocalizeAuthentication
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->routeIs('login', 'login.store', 'register', 'register.store')) {
            return $next($request);
        }

        $previousLocale = app()->getLocale();
        app()->setLocale('fa');

        try {
            return $next($request);
        } finally {
            app()->setLocale($previousLocale);
        }
    }
}
