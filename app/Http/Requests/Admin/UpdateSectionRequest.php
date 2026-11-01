<?php

namespace App\Http\Requests\Admin;

use App\Models\Section;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSectionRequest extends FormRequest
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
            'course_id' => ['required', 'integer', 'exists:courses,id', function (string $attribute, mixed $value, Closure $fail): void {
                $section = $this->route('section');
                if ((int) $value !== $section->course_id && ($section->children()->exists() || $section->parent_id !== null)) {
                    $fail('برای انتقال فصل ابتدا ارتباط والد و زیرفصل‌ها را حذف کنید.');
                }
            }],
            'name' => 'required|string|max:255',
            'parent_id' => ['nullable', 'integer', Rule::exists('sections', 'id')->where('course_id', $this->input('course_id')), function (string $attribute, mixed $value, Closure $fail): void {
                $section = $this->route('section');
                $parents = Section::where('course_id', $this->input('course_id'))->pluck('parent_id', 'id');
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
