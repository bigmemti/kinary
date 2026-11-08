<?php

namespace App\Http\Middleware;

use App\Services\ActivityLogger;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class LogActivity
{
    public function __construct(private ActivityLogger $logger) {}

    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set('activity_request_id', (string) Str::uuid());
        $isSearch = $request->routeIs('course.index', 'category.show') && filled($request->query('search'));
        $shouldLog = ! in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true) || $isSearch || $request->routeIs('callback', 'student.study.download', 'student.study.reminder-download', 'teacher.homework.download', 'teacher.content.editor.download', 'teacher.course.editor.reminder-download');
        $actorId = $request->user()?->getAuthIdentifier();

        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            if ($shouldLog) {
                $this->logger->record('request.failed', 'failure', $this->properties($request, null), actorId: $actorId);
            }

            throw $exception;
        }

        if ($shouldLog) {
            $failed = $response->getStatusCode() >= 400 || ($request->hasSession() && $request->session()->has('errors'));
            $this->logger->record($isSearch ? 'search.courses' : 'request.action', $failed ? 'failure' : 'success', $this->properties($request, $response->getStatusCode()), actorId: $actorId);
        }

        return $response;
    }

    /** @return array<string, mixed> */
    private function properties(Request $request, ?int $status): array
    {
        $parameters = [];
        foreach ($request->route()?->parameters() ?? [] as $key => $value) {
            if ($value instanceof Model) {
                $parameters[$key] = $value->getKey();
            } elseif (is_numeric($value)) {
                $parameters[$key] = $value;
            }
        }

        $properties = ['method' => $request->method(), 'route' => $request->route()?->getName(), 'parameters' => $parameters, 'status' => $status];
        if ($request->routeIs('course.index', 'category.show') && is_string($request->query('search'))) {
            $properties['search'] = mb_substr($request->query('search'), 0, 150);
        }

        if ($request->routeIs('login.store')) {
            $username = $request->input(config('fortify.username', 'email'));
            if (is_string($username)) {
                $properties['username'] = mb_substr($username, 0, 255);
            }
        }

        return $properties;
    }
}
