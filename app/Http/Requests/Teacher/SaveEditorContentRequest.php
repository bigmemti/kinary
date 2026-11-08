<?php

namespace App\Http\Requests\Teacher;

use App\Models\Content;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\VideoContent;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SaveEditorContentRequest extends FormRequest
{
    public const TYPES = ['text', 'image', 'video', 'file', 'table', 'remind', 'homework', 'quiz', 'exercise', 'deck'];

    public function authorize(): bool
    {
        $course = $this->course();
        abort_unless($course, 404);
        Gate::authorize('updateEditorStructure', $course);

        if ($this->exists('accesses') || $this->boolean('update_accesses')) {
            Gate::authorize('manageEditorCommerce', $course);
        }

        return true;
    }

    public function course(): ?Course
    {
        $lesson = $this->route('lesson');
        $content = $this->route('content');

        if ($content instanceof Content) {
            $lesson = $content->lesson;
        }

        return $lesson instanceof Lesson ? $lesson->section?->course : null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $type = $this->input('type');
        $courseId = $this->course()?->id;
        $planRule = Rule::exists('plans', 'id')->whereIn('space_id', fn ($query) => $query->select('id')->from('spaces')->where('course_id', $courseId));
        $spaceRule = Rule::exists('spaces', 'id')->whereNotNull('quiz_id');

        $rules = [
            'type' => ['required', Rule::in(self::TYPES)],
            'description' => ['nullable', 'string', 'max:2000'],
            'body' => [Rule::requiredIf(in_array($type, ['text', 'homework', 'exercise'], true)), 'nullable', 'string', 'max:65000'],
            'allowed_extensions' => ['nullable', 'string', 'max:500', 'regex:/^[a-zA-Z0-9, .]*$/'],
            'answer_body' => [Rule::requiredIf($type === 'exercise' && ! $this->filled('answer_video_url')), 'nullable', 'string', 'max:65000'],
            'answer_video_url' => [Rule::requiredIf($type === 'exercise' && ! $this->filled('answer_body')), 'nullable', 'url:http,https', 'max:2000'],
            'name' => [Rule::requiredIf(in_array($type, ['video', 'deck'], true)), 'nullable', 'string', 'max:255'],
            'cards' => [Rule::requiredIf($type === 'deck'), 'nullable', 'array', 'min:1', 'max:200'],
            'cards.*' => ['required', 'array:id,question,answer'],
            'cards.*.id' => ['nullable', 'integer', 'distinct'],
            'cards.*.question' => ['required', 'string', 'max:65000'],
            'cards.*.answer' => ['required', 'string', 'max:65000'],
            'url' => [Rule::requiredIf($type === 'video'), 'nullable', 'string', 'max:65000', function (string $attribute, mixed $value, Closure $fail) use ($type): void {
                if ($type !== 'video' || ! is_string($value)) {
                    return;
                }

                $legacyUrl = filter_var($value, FILTER_VALIDATE_URL) && preg_match('~^https?://~i', $value) && strlen($value) <= 255;
                if (! $legacyUrl && VideoContent::embedSource($value) === null) {
                    $fail('کد امبد معتبر شامل یک iframe با نشانی http یا https وارد کنید');
                }
            }],
            'image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'],
            'content_file' => ['nullable', 'file', 'max:51200', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,txt,csv'],
            'table' => [Rule::requiredIf($type === 'table'), 'nullable', 'array', 'min:1', 'max:50'],
            'table.*' => ['required', 'array', 'min:1', 'max:20'],
            'table.*.*' => ['nullable', 'string', 'max:500'],
            'content_id' => [Rule::requiredIf($type === 'remind'), 'nullable', 'integer', Rule::exists('contents', 'id')],
            'update_accesses' => ['sometimes', 'boolean'],
            'accesses' => ['sometimes', 'array', 'max:50'],
            'accesses.*' => ['required', 'array:plan_id,requirements,answer_release,answer_video_release'],
            'accesses.*.answer_release' => ['sometimes', Rule::in($type === 'exercise' ? ['never', 'always'] : ['never', 'approved', 'submitted', 'always'])],
            'accesses.*.answer_video_release' => ['sometimes', Rule::in($type === 'exercise' ? ['never', 'always'] : ['never', 'approved', 'submitted', 'always'])],
            'accesses.*.plan_id' => ['required', 'integer', 'distinct', $planRule],
            'accesses.*.requirements' => ['sometimes', 'array', 'max:20', function (string $attribute, mixed $value, Closure $fail): void {
                if (! is_array($value)) {
                    return;
                }
                $spaces = array_column($value, 'space_id');
                if (count($spaces) !== count(array_unique($spaces))) {
                    $fail('هر اسپیس پیش‌نیاز فقط یک بار در هر پلن قابل انتخاب است.');
                }
            }],
            'accesses.*.requirements.*' => ['required', 'array:space_id,score'],
            'accesses.*.requirements.*.space_id' => ['required', 'integer', $spaceRule],
            'accesses.*.requirements.*.score' => ['required', 'integer', 'min:0', 'max:100'],
        ];

        return $rules;
    }
}
