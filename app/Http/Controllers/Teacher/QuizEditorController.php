<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\FileContent;
use App\Models\ImageContent;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\RemindContent;
use App\Models\Space;
use App\Models\TableContent;
use App\Models\TextContent;
use App\Models\VideoContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class QuizEditorController extends Controller
{
    public function edit(Request $request, Space $space): Response
    {
        Gate::authorize('updateEditorStructure', $space->course);
        $lesson = $request->integer('lesson') ? Lesson::query()->findOrFail($request->integer('lesson')) : null;
        abort_if($lesson && $lesson->section->course_id !== $space->course_id, 404);
        if (! $lesson) {
            Gate::authorize('manageEditorCommerce', $space->course);
        }
        $content = $request->integer('content') ? Content::query()->findOrFail($request->integer('content')) : null;
        abort_if($content && (! $lesson || $content->lesson_id !== $lesson->id), 404);
        $quiz = $content?->contentable_type === Quiz::class ? $content->contentable : ($lesson ? null : Quiz::query()->find($space->quiz_id));
        abort_if($quiz && $quiz->space_id !== $space->id, 404);

        return inertia('teacher/quiz/editor', [
            'space' => $space->only(['id', 'name', 'course_id']),
            'lessonId' => $lesson?->id, 'contentId' => $content?->id,
            'contentDescription' => $content?->description,
            'quiz' => $quiz ? [...$quiz->only(['id', 'title', 'description', 'duration_seconds', 'correct_score', 'wrong_penalty', 'passing_score', 'guest_attempt_limit']),
                'questionIds' => $quiz->questions()->pluck('questions.id'),
                'attempted' => $quiz->attempts()->whereNotNull('started_at')->whereNull('finished_at')->exists()] : null,
            'bank' => $space->questions()->with('choices')->get()->map(fn ($q) => ['id' => $q->id, 'body' => $q->body]),
            'plans' => $space->plans()->get(['id', 'name'])->map(fn ($plan) => [
                'id' => $plan->id, 'name' => $plan->name,
                'limit' => $quiz ? DB::table('plan_quiz')->where('quiz_id', $quiz->id)->where('plan_id', $plan->id)->value('attempt_limit') : 0,
                'enabled' => $quiz ? DB::table('plan_quiz')->where('quiz_id', $quiz->id)->where('plan_id', $plan->id)->exists() : ($content?->accesses()->where('plan_id', $plan->id)->exists() ?? false),
            ]),
        ]);
    }

    public function save(Request $request, Space $space): RedirectResponse
    {
        Gate::authorize('updateEditorStructure', $space->course);
        $data = $request->validate([
            'lesson_id' => 'nullable|integer|exists:lessons,id', 'content_id' => 'nullable|integer|exists:contents,id',
            'title' => 'required|string|max:255', 'description' => 'nullable|string|max:2000',
            'duration_seconds' => 'required|integer|min:1|max:86399', 'correct_score' => 'required|numeric|gt:0|max:100000',
            'wrong_penalty' => 'required|numeric|min:0|max:100000', 'passing_score' => 'nullable|numeric|min:0|max:100',
            'guest_attempt_limit' => 'required|integer|min:0|max:100000',
            'question_ids' => 'present|array', 'question_ids.*' => 'integer|distinct',
            'new_questions' => 'present|array', 'new_questions.*.body' => 'required|string|max:65000',
            'new_questions.*.choices' => 'required|array|size:4', 'new_questions.*.choices.*' => 'required|string|max:2000',
            'new_questions.*.correct' => 'required|integer|between:0,3',
            'plans' => 'present|array', 'plans.*.id' => 'required|integer|distinct',
            'plans.*.enabled' => 'required|boolean', 'plans.*.limit' => 'nullable|integer|min:0|max:100000',
        ]);
        $lesson = isset($data['lesson_id']) ? Lesson::query()->findOrFail($data['lesson_id']) : null;
        abort_if($lesson && $lesson->section->course_id !== $space->course_id, 404);
        if (! $lesson) {
            Gate::authorize('manageEditorCommerce', $space->course);
            if (($data['passing_score'] ?? null) === null) {
                throw ValidationException::withMessages(['passing_score' => 'حد قبولی آزمون پایانی الزامی است.']);
            }
        }
        Gate::authorize('manageEditorCommerce', $space->course);

        $contentId = null;
        $obsoleteFile = null;
        DB::transaction(function () use ($data, $space, $lesson, &$contentId, &$obsoleteFile): void {
            $space = Space::query()->lockForUpdate()->findOrFail($space->id);
            $content = isset($data['content_id']) ? Content::query()->lockForUpdate()->findOrFail($data['content_id']) : null;
            abort_if($content && (! $lesson || $content->lesson_id !== $lesson->id), 404);
            $quiz = $content?->contentable_type === Quiz::class ? $content->contentable : ($lesson ? null : Quiz::query()->find($space->quiz_id));
            abort_if($quiz && $quiz->space_id !== $space->id, 404);
            if ($quiz && $quiz->attempts()->whereNotNull('started_at')->whereNull('finished_at')->exists()) {
                throw ValidationException::withMessages(['quiz' => 'تا پایان تلاش‌های فعال، امکان ویرایش این آزمون وجود ندارد.']);
            }
            if ($space->questions()->whereIn('id', $data['question_ids'])->count() !== count($data['question_ids'])) {
                throw ValidationException::withMessages(['question_ids' => 'سؤال‌ها باید از بانک همین فضا انتخاب شوند.']);
            }
            if (count($data['question_ids']) + count($data['new_questions']) === 0) {
                throw ValidationException::withMessages(['question_ids' => 'حداقل یک سؤال انتخاب کنید.']);
            }
            if ($space->plans()->whereIn('id', array_column($data['plans'], 'id'))->count() !== count($data['plans'])) {
                throw ValidationException::withMessages(['plans' => 'پلن انتخاب‌شده متعلق به این فضا نیست.']);
            }
            $quiz ??= new Quiz;
            $quiz->space_id = $space->id;
            foreach (['title', 'description', 'duration_seconds', 'correct_score', 'wrong_penalty', 'guest_attempt_limit'] as $key) {
                $quiz->{$key} = $data[$key] ?? null;
            }
            $quiz->passing_score = $lesson ? null : $data['passing_score'];
            $quiz->time = gmdate('H:i:s', $data['duration_seconds']);
            $quiz->score = 0;
            $quiz->save();
            $ids = $data['question_ids'];
            foreach ($data['new_questions'] as $item) {
                $question = $space->questions()->create(['body' => $item['body']]);
                foreach ($item['choices'] as $index => $body) {
                    $question->choices()->create(['body' => $body, 'is_correct' => $index === (int) $item['correct']]);
                }
                $ids[] = $question->id;
            }
            $quiz->questions()->sync(collect($ids)->values()->mapWithKeys(fn ($id, $index) => [$id => ['order' => $index]])->all());
            DB::table('plan_quiz')->where('quiz_id', $quiz->id)->delete();
            foreach ($data['plans'] as $plan) {
                if ($plan['enabled']) {
                    DB::table('plan_quiz')->insert(['plan_id' => $plan['id'], 'quiz_id' => $quiz->id, 'attempt_limit' => $plan['limit'] ?? null]);
                }
            }
            if ($lesson) {
                if (! $content) {
                    $content = Content::query()->create(['lesson_id' => $lesson->id, 'description' => $data['description'] ?? '',
                        'order' => (int) $lesson->contents()->max('order') + 1, 'contentable_type' => Quiz::class, 'contentable_id' => $quiz->id]);
                } elseif ($content->contentable_type !== Quiz::class) {
                    $old = $content->contentable;
                    abort_unless($old && in_array($old::class, [TextContent::class, ImageContent::class, VideoContent::class, FileContent::class, TableContent::class, RemindContent::class], true), 422);
                    if ($old instanceof ImageContent || $old instanceof FileContent) {
                        $obsoleteFile = ['disk' => $old instanceof ImageContent ? 'public' : 'local', 'path' => $old->path];
                    }
                    $content->update(['contentable_type' => Quiz::class, 'contentable_id' => $quiz->id, 'description' => $data['description'] ?? '']);
                    $old->delete();
                }
                $contentId = $content->id;
                $enabledPlanIds = collect($data['plans'])->where('enabled', true)->pluck('id')->all();
                $removed = $content->accesses()->whereNotIn('plan_id', $enabledPlanIds)->pluck('id');
                DB::table('requirements')->whereIn('access_id', $removed)->delete();
                $content->accesses()->whereIn('id', $removed)->delete();
                foreach ($data['plans'] as $plan) {
                    if ($plan['enabled']) {
                        $content->accesses()->firstOrCreate(['plan_id' => $plan['id']]);
                    }
                }
            } else {
                $space->update(['quiz_id' => $quiz->id]);
            }
        });

        if ($obsoleteFile) {
            Storage::disk($obsoleteFile['disk'])->delete($obsoleteFile['path']);
        }

        return to_route('teacher.course.editor', $space->course_id)->with('editor_return', $lesson
            ? ['tab' => 'content', 'sectionId' => $lesson->section_id, 'lessonId' => $lesson->id, 'contentId' => $contentId]
            : ['tab' => 'spaces']);
    }
}
