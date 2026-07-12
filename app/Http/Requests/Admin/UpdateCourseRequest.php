<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('update', request()->course);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'teacher_id' => 'required|integer|exists:teachers,id',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:courses,slug,'.request()->course->id,
            'description' => 'nullable|string|max:4096',
            'thumbnail' => 'nullable|string|max:255',
            'intro_video_url' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,published',
        ];
    }
}
