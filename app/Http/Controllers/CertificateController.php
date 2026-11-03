<?php

namespace App\Http\Controllers;

use App\Services\QuizService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class CertificateController extends Controller
{
    public function index(Request $request, QuizService $quizService): Response
    {
        $quizService->reconcileCertificates($request->user()->student);
        $certificates = DB::table('grades')->join('attempts', 'attempts.id', '=', 'grades.attempt_id')
            ->join('spaces', 'spaces.id', '=', 'grades.space_id')->join('courses', 'courses.id', '=', 'spaces.course_id')
            ->where('grades.student_id', $request->user()->student->id)->whereNotNull('grades.certificate_token')
            ->orderByDesc('grades.created_at')->get(['spaces.name as space', 'courses.title as course', 'attempts.score', 'grades.certificate_token']);

        return inertia('student/certificate/index', ['certificates' => $certificates->map(fn ($certificate) => [
            'space' => $certificate->space, 'course' => $certificate->course, 'score' => $certificate->score,
            'url' => route('certificate.show', $certificate->certificate_token),
        ])]);
    }

    public function show(string $token): Response
    {
        $grade = DB::table('grades')->join('attempts', 'attempts.id', '=', 'grades.attempt_id')
            ->join('students', 'students.id', '=', 'grades.student_id')->join('users', 'users.id', '=', 'students.user_id')
            ->join('spaces', 'spaces.id', '=', 'grades.space_id')->join('courses', 'courses.id', '=', 'spaces.course_id')
            ->where('grades.certificate_token', $token)->first(['users.name as student', 'spaces.name as space', 'courses.title as course', 'attempts.score', 'grades.created_at']);
        abort_unless($grade, 404);

        return inertia('certificate/show', ['certificate' => $grade]);
    }
}
