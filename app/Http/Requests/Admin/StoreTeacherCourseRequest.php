<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
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
            'title' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[\pL\pN_-]+$/u', 'unique:courses,slug'],
            'description' => 'nullable|string|max:4096',
            'thumbnail' => 'nullable|string|max:255',
            'intro_video_url' => 'nullable|string|max:255',
            'status' => 'in:draft,published',
        ];
    }
}
