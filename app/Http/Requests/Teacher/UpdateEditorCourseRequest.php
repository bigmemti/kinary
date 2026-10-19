<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateEditorCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        Gate::authorize('updateEditorInformation', $this->route('course'));

        if ($this->exists('is_published')) {
            Gate::authorize('publishEditorCourse', $this->route('course'));
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
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[\pL\pN_-]+$/u', Rule::unique('courses', 'slug')->ignore($this->route('course'))],
            'description' => ['nullable', 'string', 'max:4096'],
            'thumbnail' => ['nullable', 'string', 'max:255', Rule::when($this->input('thumbnail') !== $this->route('course')->thumbnail, 'url:http,https')],
            'intro_video_url' => ['nullable', 'string', 'max:255', Rule::when($this->input('intro_video_url') !== $this->route('course')->intro_video_url, 'url:http,https')],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['title' => 'عنوان دوره', 'slug' => 'شناسه متنی', 'description' => 'توضیحات', 'thumbnail' => 'نشانی تصویر', 'intro_video_url' => 'نشانی ویدئوی معرفی', 'is_published' => 'وضعیت انتشار'];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => 'وارد کردن :attribute الزامی است.',
            'string' => ':attribute باید متن باشد.',
            'max' => ':attribute نباید بیش از :max نویسه باشد.',
            'url' => ':attribute باید یک نشانی معتبر با http یا https باشد.',
            'slug.regex' => 'شناسه متنی فقط می‌تواند شامل حروف، عدد، خط تیره و زیرخط باشد.',
            'slug.unique' => 'این شناسه متنی قبلاً استفاده شده است.',
            'is_published.boolean' => 'وضعیت انتشار معتبر نیست.',
        ];
    }
}
