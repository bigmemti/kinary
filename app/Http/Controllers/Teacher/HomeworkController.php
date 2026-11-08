<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Content;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HomeworkController extends Controller
{
    private function authorizeHomework(Content $content): void
    {
        abort_unless($content->contentable_type === Assignment::class, 404);
        Gate::authorize('updateEditorStructure', $content->lesson->section->course);
    }

    public function index(Content $content): Response
    {
        $this->authorizeHomework($content);
        $submissions = DB::table('submissions')->join('students', 'students.id', '=', 'submissions.student_id')
            ->join('users', 'users.id', '=', 'students.user_id')->where('assignment_id', $content->contentable_id)
            ->select('submissions.id', 'users.name', 'submissions.score', 'submissions.note', 'submissions.approved_at', 'submissions.created_at')->orderByDesc('submissions.id')->get();
        foreach ($submissions as $submission) {
            $submission->files = DB::table('submission_files')->where('submission_id', $submission->id)->get(['id', 'name']);
        }

        return Inertia::render('teacher/homework/index', ['contentId' => $content->id, 'question' => $content->contentable->body, 'submissions' => $submissions]);
    }

    public function download(Content $content, int $file): StreamedResponse
    {
        $this->authorizeHomework($content);
        $record = DB::table('submission_files')->join('submissions', 'submissions.id', '=', 'submission_files.submission_id')
            ->where('submissions.assignment_id', $content->contentable_id)->where('submission_files.id', $file)->first(['submission_files.path', 'submission_files.name']);
        abort_unless($record && Storage::disk('local')->exists($record->path), 404);
        $name = str_replace(['/', '\\', "\r", "\n"], '_', $record->name);

        return Storage::disk('local')->download($record->path, $name, ['X-Content-Type-Options' => 'nosniff']);
    }

    public function approve(Request $request, Content $content, int $submission): RedirectResponse
    {
        $this->authorizeHomework($content);
        $data = $request->validate(['score' => ['nullable', 'integer', 'min:0', 'max:100'], 'note' => ['nullable', 'string', 'max:65000']]);
        DB::transaction(function () use ($content, $submission, $data): void {
            Assignment::query()->whereKey($content->contentable_id)->lockForUpdate()->firstOrFail();
            $record = DB::table('submissions')->where('assignment_id', $content->contentable_id)->where('id', $submission)->lockForUpdate()->first();
            abort_unless($record, 404);
            DB::table('submissions')->where('id', $submission)->update(['score' => $data['score'] ?? null, 'note' => $data['note'] ?? null, 'approved_at' => $record->approved_at ?? now(), 'updated_at' => now()]);
            app(ActivityLogger::class)->record('homework.reviewed', properties: ['submission_id' => $submission, 'before' => ['score' => $record->score, 'note' => $record->note, 'approved_at' => $record->approved_at], 'after' => ['score' => $data['score'] ?? null, 'note' => $data['note'] ?? null, 'approved_at' => (string) ($record->approved_at ?? now())]]);
        });

        return back();
    }
}
