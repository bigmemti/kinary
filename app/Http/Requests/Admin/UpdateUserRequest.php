<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['phone' => User::normalizePhone($this->input('phone'))]);
    }

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
            'name' => 'string|required|min:2|max:255',
            'phone' => User::phoneRules(),
            'email' => 'email|required|min:2|max:255|unique:users,email,'.request('user')->id,
        ];
    }
}
