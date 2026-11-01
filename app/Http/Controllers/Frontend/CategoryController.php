<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function show(Request $request, Category $category): Response
    {
        $validated = $request->validate(['search' => ['nullable', 'string', 'max:150']], [
            'search.string' => 'عبارت جستجو باید متن باشد.',
            'search.max' => 'عبارت جستجو نباید بیشتر از ۱۵۰ نویسه باشد.',
        ]);
        $search = trim($validated['search'] ?? '');
        $description = $category->description ?: 'دوره‌های دسته‌بندی '.$category->name.' را در آکادمی ببینید.';

        return Inertia::render('category/show', [
            'canonicalUrl' => route('category.show', $category->slug),
            'category' => $category->only(['id', 'name', 'slug', 'description']),
            'search' => $search,
            'courses' => Course::query()
                ->select(['id', 'title', 'slug', 'description', 'thumbnail'])
                ->where('is_published', true)
                ->whereHas('spaces.categories', fn (Builder $query): Builder => $query->where('categories.id', $category->id))
                ->when($search !== '', fn (Builder $query): Builder => $query
                    ->where(fn (Builder $query): Builder => $query
                        ->whereLike('title', '%'.$search.'%')
                        ->orWhereLike('description', '%'.$search.'%')))
                ->with('teacher.user:id,name')
                ->latest('created_at')->orderByDesc('id')
                ->paginate(12)->withQueryString(),
        ])->withViewData([
            'storefrontTitle' => $category->name.' | آکادمی',
            'storefrontDescription' => $description,
        ]);
    }
}
