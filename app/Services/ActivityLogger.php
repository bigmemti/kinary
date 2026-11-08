<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ActivityLogger
{
    /** @param array<string, mixed> $properties */
    public function record(string $event, string $outcome = 'success', array $properties = [], ?Model $subject = null, ?int $actorId = null): void
    {
        $request = app()->bound('request') ? request() : null;

        DB::table('activity_logs')->insert([
            'event' => $event,
            'outcome' => $outcome,
            'actor_id' => $actorId ?? Auth::id(),
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'ip_address' => $request?->ip(),
            'request_id' => $request?->attributes->get('activity_request_id'),
            'properties' => json_encode($properties, JSON_THROW_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE),
            'created_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $constraints
     * @param  list<string>  $columns
     * @return list<array<string, mixed>>
     */
    public function snapshot(string $table, array $constraints, array $columns): array
    {
        $query = DB::table($table)->where($constraints);
        foreach ($columns as $column) {
            $query->orderBy($column);
        }

        return $query->get($columns)->map(fn (object $row): array => (array) $row)->all();
    }

    /** @param array<mixed> $before
     * @param  array<mixed>  $after
     */
    public function recordChanges(string $event, array $before, array $after, ?Model $subject = null): void
    {
        if ($before !== $after) {
            $properties = $before === [] && $after !== [] ? ['attributes' => $after] : ['before' => $before, 'after' => $after];
            $this->record($event, properties: $properties, subject: $subject);
        }
    }

    public function modelChanged(string $event, Model $model): void
    {
        if (! Str::startsWith($model::class, 'App\\Models\\')) {
            return;
        }

        $attributes = $event === 'updated' ? $model->getChanges() : $model->getAttributes();
        $attributes = $this->safeAttributes($model, $attributes);
        $properties = ['attributes' => $attributes];

        if ($event === 'updated') {
            $original = $model->getRawOriginal();
            $properties = [
                'before' => $this->safeAttributes($model, array_intersect_key($original, $attributes)),
                'after' => $attributes,
            ];
        }

        $this->record('model.'.$event, properties: $properties, subject: $model);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function safeAttributes(Model $model, array $attributes): array
    {
        foreach ($attributes as $key => $value) {
            if (in_array($key, $model->getHidden(), true) || preg_match('/password|secret|token|recovery|authority|credential|api.?key/i', $key)) {
                unset($attributes[$key]);

                continue;
            }

            if (is_string($value) && json_validate($value)) {
                $decoded = json_decode($value, true);
                if (is_array($decoded)) {
                    $value = $decoded;
                }
            }
            if (is_array($value)) {
                $attributes[$key] = $this->safeAttributes($model, $value);
            }
        }

        return $attributes;
    }
}
