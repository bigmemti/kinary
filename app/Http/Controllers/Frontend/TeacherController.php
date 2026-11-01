<?php

namespace App\Http\Controllers\Frontend;

use App\Enums\TeacherRole;
use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Inertia\Response;

class TeacherController extends Controller
{
    public function show(Teacher $teacher): Response
    {
        $teacher->load('user:id,name');
        $courses = $teacher->courses()->where('is_published', true)
            ->whereIn('course_teacher.role', [TeacherRole::Owner, TeacherRole::Instructor])
            ->with('teacher.user:id,name')->latest('courses.created_at')->get(['courses.id', 'courses.title', 'courses.slug', 'courses.description', 'courses.thumbnail']);

        abort_if($courses->isEmpty(), 404);

        return inertia('teacher/show', [
            'canonicalUrl' => route('teacher.show', $teacher),
            'teacher' => ['id' => $teacher->id, 'name' => $teacher->user->name, 'description' => $teacher->description],
            'courses' => $courses,
        ])->withViewData([
            'storefrontTitle' => $teacher->user->name.' | آکادمی',
            'storefrontDescription' => $teacher->description ?: 'دوره‌های '.$teacher->user->name.' در آکادمی',
        ]);
    }
}
