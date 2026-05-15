<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('admin/user/index', [
            'users' => User::all()->load(['wallet', 'student', 'teacher']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('admin/user/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        User::create([...$request->validated(), 'password' => '']);

        return to_route('admin.user.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return inertia('admin/user/show', [
            'user' => $user->load([
                'wallet' => fn($query) => $query->withCount('orders'),
                'wallet.orders' => fn($query) => $query->withSum('plans as amount', 'price'), 
                'student' => fn($query) => $query->withCount('enrollments'), 
                'student.enrollments.plan.course', 
                'teacher' => fn($query) => $query->withCount('courses'),
                'teacher.courses', 
            ])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return inertia('admin/user/edit', [
            'user' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());

        return to_route('admin.user.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
    }
}
