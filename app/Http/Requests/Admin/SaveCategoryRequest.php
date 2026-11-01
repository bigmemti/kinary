<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[\pL\pN_-]+$/u', Rule::unique('categories', 'slug')->ignore($this->route('category'))],
        ];
    }
}
