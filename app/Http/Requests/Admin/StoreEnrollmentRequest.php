<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
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
            'plan_id' => ['required','integer','exists:plans,id',  Rule::unique('enrollments')->where('student_id', request()->student_id)],
            'student_id' => ['required','integer','exists:students,id',  Rule::unique('enrollments')->where('plan_id', request()->plan_id)],
        ];
    }
}
