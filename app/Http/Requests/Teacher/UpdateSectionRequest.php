<?php

namespace App\Http\Requests\Teacher;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateSectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $course = $this->route('course') ?? $this->route('section')?->course;
        abort_unless($course, 404);
        Gate::authorize('updateEditorStructure', $course);

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'order' => 'sometimes|integer|min:0|max:32767',
            'parent_id' => ['nullable', 'integer', Rule::exists('sections', 'id')->where('course_id', $this->route('section')->course_id), function (string $attribute, mixed $value, Closure $fail): void {
                $section = $this->route('section');
                $parents = $section->course->sections()->pluck('parent_id', 'id');
                $seen = [];
                while ($value !== null && $value !== '') {
                    $id = (int) $value;
                    if ($id === $section->id || isset($seen[$id])) {
                        $fail('فصل والد معتبر نیست.');

                        return;
                    }
                    $seen[$id] = true;
                    $value = $parents->get($id);
                }
            }],
        ];
    }
}
