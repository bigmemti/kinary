<?php

namespace App\Http\Requests\Teacher;

use App\Enums\TeacherRole;
use App\Models\Teacher;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCourseTeachersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        Gate::authorize('manageEditorTeachers', $this->route('course'));

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
            'teachers' => ['required', 'array', 'list', 'min:1', 'max:100'],
            'teachers.*' => ['required', 'array:id,role'],
            'teachers.*.id' => ['required', 'integer', 'distinct', Rule::exists('teachers', 'id')],
            'teachers.*.role' => ['required', Rule::enum(TeacherRole::class)],
        ];
    }

    /**
     * @return list<\Closure(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $teachers = collect($this->input('teachers'));

            if (! $teachers->contains('role', TeacherRole::Owner->value)) {
                $validator->errors()->add('teachers', 'دوره باید حداقل یک مالک داشته باشد. پیش از حذف یا تغییر سمت مالک آخر، مالک دیگری تعیین کنید.');
            }

            $eligibleIds = Teacher::query()->whereKey($teachers->pluck('id'))
                ->whereHas('user', fn (Builder $query) => $query->role('teacher'))->pluck('id');

            foreach ($teachers as $index => $teacher) {
                if (! $eligibleIds->contains($teacher['id'])) {
                    $validator->errors()->add("teachers.{$index}.id", 'مدرس انتخاب‌شده نقش فعال مدرس ندارد.');
                }
            }
        }];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'teachers.required' => 'دوره باید حداقل یک مالک داشته باشد.',
            'teachers.min' => 'دوره باید حداقل یک مالک داشته باشد.',
            'teachers.max' => 'حداکثر ۱۰۰ مدرس می‌توانید انتخاب کنید.',
            'teachers.array' => 'فهرست مدرس‌ها معتبر نیست.',
            'teachers.list' => 'فهرست مدرس‌ها معتبر نیست.',
            'teachers.*.array' => 'اطلاعات مدرس فقط باید شامل شناسه و سمت باشد.',
            'teachers.*.id.required' => 'مدرس را انتخاب کنید.',
            'teachers.*.id.integer' => 'شناسه مدرس معتبر نیست.',
            'teachers.*.id.distinct' => 'یک مدرس نمی‌تواند دو بار در دوره ثبت شود.',
            'teachers.*.id.exists' => 'مدرس انتخاب‌شده وجود ندارد.',
            'teachers.*.role.required' => 'سمت مدرس را انتخاب کنید.',
            'teachers.*.role.enum' => 'سمت مدرس معتبر نیست.',
        ];
    }
}
