<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Teacher;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('home', [
            'canonicalUrl' => route('home'),
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
            ])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
