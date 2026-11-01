<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return inertia('admin/category/index', ['categories' => Category::query()->orderBy('name')->get()]);
    }

    public function create(): Response
    {
        return inertia('admin/category/create');
    }

    public function store(SaveCategoryRequest $request): RedirectResponse
    {
        $category = new Category;
        $category->fill($request->validated());
        $category->save();

        return to_route('admin.category.index');
    }

    public function show(Category $category): Response
    {
        return inertia('admin/category/show', ['category' => $category]);
    }

    public function edit(Category $category): Response
    {
        return inertia('admin/category/edit', ['category' => $category]);
    }

    public function update(SaveCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->fill($request->validated());
        $category->save();

        return to_route('admin.category.index');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->spaces()->exists()) {
            return back()->withErrors(['category' => 'دسته‌بندی دارای فضای آموزشی است و نمی‌توان آن را حذف کرد.']);
        }

        $category->delete();

        return to_route('admin.category.index');
    }
}
