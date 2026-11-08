<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Discussion;
use App\Models\Teacher;
use App\Services\CommunityService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request, CommunityService $community): Response
    {
        return Inertia::render('home', [
            'canonicalUrl' => route('home'),
            'comments' => $community->comments(null, $request->user()),
            'courses' => Course::published()->with('teacher.user:id,name')->latest('created_at')->limit(6)->get(['id', 'title', 'slug', 'description', 'thumbnail']),
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'teachers' => Teacher::ownerOrInstructor()->with('user:id,name')->orderBy('id')->limit(4)->get()
                ->map(fn (Teacher $teacher): array => ['id' => $teacher->id, 'name' => $teacher->user->name, 'description' => $teacher->description]),
        ])->withViewData([
            'storefrontTitle' => 'یادگیری مهندسی نرم‌افزار | آکادمی',
            'storefrontDescription' => 'آموزش مبانی دانشگاهی و مهارت‌های بازار کار با هدف تربیت مهندس نرم‌افزار. دوره‌ها و مدرسین آکادمی را بشناسید.',
        ]);
    }

    public function sitemap()
    {
        return response()
            ->view('sitemap', [
                'courses' => Course::published()->get(['id', 'slug']),
                'categories' => Category::get(['id', 'slug']),
                'teachers' => Teacher::ownerOrInstructor()->get(['id']),
                'discussions' => Discussion::query()->where('is_public', true)->whereNull('lesson_id')
                    ->where(fn ($query) => $query->whereNull('source_comment_id')->orWhereExists(
                        fn ($comments) => $comments->selectRaw('1')->from('comments')
                            ->whereColumn('comments.id', 'discussions.source_comment_id')->where('comments.status', 'visible')
                    ))
                    ->where(fn ($query) => $query->whereNull('course_id')->orWhereHas('course', fn ($course) => $course->where('is_published', true)))
                    ->get(['id', 'name', 'updated_at']),
            ])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
