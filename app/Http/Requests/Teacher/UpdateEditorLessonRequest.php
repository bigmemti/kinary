<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateEditorLessonRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $course = $this->route('lesson')?->section?->course;
        abort_unless($course, 404);
        Gate::authorize('updateEditorStructure', $course);

        if ($this->exists('pricings') || $this->boolean('update_pricings')) {
            Gate::authorize('manageEditorCommerce', $course);
        }

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
            'name' => ['required', 'string', 'max:255'],
            'order' => ['required', 'integer', 'min:0', 'max:32767'],
            'thumbnail_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_thumbnail' => ['sometimes', 'boolean'],
            'image_files' => ['sometimes', 'array', 'max:10'],
            'image_files.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_images' => ['sometimes', 'array', 'max:10'],
            'remove_images.*' => ['required', 'string', 'distinct', Rule::in($this->route('lesson')->images ?? [])],
            'pricings' => ['sometimes', 'array'],
            'update_pricings' => ['sometimes', 'boolean'],
            'pricings.*' => ['required', 'array:plan_id,price'],
            'pricings.*.plan_id' => ['required', 'integer', 'distinct', Rule::exists('plans', 'id')->whereIn('space_id', $this->route('lesson')->section->course->spaces()->select('id'))],
            'pricings.*.price' => ['required', 'integer', 'min:0', 'max:4294967295'],
        ];
    }
}
