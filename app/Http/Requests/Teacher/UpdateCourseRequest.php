<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:courses,slug,'. request()->course->id,
            'description' => 'nullable|string|max:4096',
            'thumbnail' => 'nullable|string|max:255',
            'intro_video_url' => 'nullable|string|max:255',
            'status' => 'in:draft,published',
        ];
    }
}
