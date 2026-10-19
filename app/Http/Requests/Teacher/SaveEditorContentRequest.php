<?php

namespace App\Http\Requests\Teacher;

use App\Models\Content;
use App\Models\Course;
use App\Models\Lesson;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SaveEditorContentRequest extends FormRequest
{
    public const TYPES = ['text', 'image', 'video', 'file', 'table', 'remind'];

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
        $spaceRule = Rule::exists('spaces', 'id')->where('course_id', $courseId)->whereNotNull('quiz_id');

        $rules = [
            'type' => ['required', Rule::in(self::TYPES)],
            'description' => ['nullable', 'string', 'max:2000'],
            'body' => [Rule::requiredIf($type === 'text'), 'nullable', 'string', 'max:65000'],
            'name' => [Rule::requiredIf(in_array($type, ['video'], true)), 'nullable', 'string', 'max:255'],
            'url' => [Rule::requiredIf($type === 'video'), 'nullable', 'url:http,https', 'max:2000'],
            'image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'],
            'content_file' => ['nullable', 'file', 'max:51200', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,txt,csv'],
            'table' => [Rule::requiredIf($type === 'table'), 'nullable', 'array', 'min:1', 'max:50'],
            'table.*' => ['required', 'array', 'min:1', 'max:20'],
            'table.*.*' => ['nullable', 'string', 'max:500'],
            'content_id' => [Rule::requiredIf($type === 'remind'), 'nullable', 'integer', Rule::exists('contents', 'id')->whereIn('lesson_id', fn ($query) => $query->select('lessons.id')->from('lessons')->join('sections', 'sections.id', '=', 'lessons.section_id')->where('sections.course_id', $courseId))],
            'update_accesses' => ['sometimes', 'boolean'],
            'accesses' => ['sometimes', 'array', 'max:50'],
            'accesses.*' => ['required', 'array:plan_id,requirements'],
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
            'accesses.*.requirements.*.score' => ['required', 'integer', 'min:0', 'max:32767'],
        ];

        return $rules;
    }
}
