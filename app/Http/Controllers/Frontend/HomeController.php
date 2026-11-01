<?php

namespace App\Http\Controllers\Frontend;

use App\Enums\TeacherRole;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('home', [
            'canonicalUrl' => route('home'),
            'courses' => Course::query()
                ->select(['id', 'title', 'slug', 'description', 'thumbnail'])
                ->where('is_published', true)
                ->with('teacher.user:id,name')
                ->latest('created_at')->orderByDesc('id')->limit(6)->get(),
            'categories' => Category::query()->select(['id', 'name', 'slug'])->orderBy('name')->get(),
            'teachers' => Teacher::query()
                ->whereHas('courses', fn (Builder $query): Builder => $query
                    ->where('is_published', true)
                    ->whereIn('course_teacher.role', [TeacherRole::Owner, TeacherRole::Instructor]))
                ->with('user:id,name')->orderBy('id')->limit(4)->get()
                ->map(fn (Teacher $teacher): array => [
                    'id' => $teacher->id,
                    'name' => $teacher->user->name,
                    'description' => $teacher->description,
                ]),
        ])->withViewData([
            'storefrontTitle' => 'یادگیری مهندسی نرم‌افزار | آکادمی',
            'storefrontDescription' => 'آموزش مبانی دانشگاهی و مهارت‌های بازار کار با هدف تربیت مهندس نرم‌افزار. دوره‌ها و مدرسین آکادمی را بشناسید.',
        ]);
    }
}
