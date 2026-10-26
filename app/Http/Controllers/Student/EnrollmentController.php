<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Services\StudyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, StudyService $study): Response
    {
        return inertia('student/enrollment/index', [
            'spaces' => $study->library($request->user()),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Enrollment $enrollment): RedirectResponse
    {
        abort_unless($enrollment->student_id === $request->user()->student?->id && $enrollment->is_active, 404);

        return to_route('student.enrollment.index', ['space' => $enrollment->plan->space_id]);
    }
}
