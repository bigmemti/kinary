<?php

namespace App\Http\Requests\Admin;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('paid_at') && $this->paid_at) {
            $formattedDate = Carbon::parse($this->paid_at)->toDateTimeString();
                
            $this->merge(['paid_at' => $formattedDate]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => 'required|integer',
            'gateway' => 'string|required|in:zarinpal',
            'status' => 'string|required|in:paid,pending,failed',
            'paid_at' => 'required|date',
        ];
    }
}
