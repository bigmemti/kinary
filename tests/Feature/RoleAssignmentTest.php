<?php

use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\AdminSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('the role seeder can run repeatedly without creating permissions or duplicate roles', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(RoleAndPermissionSeeder::class);

    expect(Role::where('guard_name', 'web')->pluck('name')->sort()->values()->all())
        ->toBe(['student', 'teacher', 'user'])
        ->and(Permission::count())->toBe(0);
});

test('the admin seeder creates the roles before creating its user', function () {
    Role::all()->each->delete();

    $this->seed(AdminSeeder::class);

    $user = User::where('email', 'test@example.com')->firstOrFail();

    expect($user->getRoleNames()->sort()->values()->all())->toBe(['student', 'user'])
        ->and($user->wallet)->not->toBeNull()
        ->and($user->student)->not->toBeNull()
        ->and(Role::count())->toBe(3);
});

test('users created from the admin panel receive a wallet and student with their roles', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)->post(route('admin.user.store'), [
        'name' => 'New User',
        'email' => 'new-user@example.com',
    ])->assertRedirect(route('admin.user.index'));

    $user = User::where('email', 'new-user@example.com')->firstOrFail();

    expect($user->wallet)->not->toBeNull()
        ->and($user->student)->not->toBeNull()
        ->and($user->getRoleNames()->sort()->values()->all())->toBe(['student', 'user']);
});

test('removing a student revokes only the student role', function () {
    $user = User::factory()->create();
    Teacher::factory()->for($user)->create();

    $this->actingAs($user)->delete(route('admin.student.destroy', $user->student))
        ->assertRedirect(route('admin.student.index'));

    expect($user->fresh()->student)->toBeNull()
        ->and($user->fresh()->getRoleNames()->sort()->values()->all())->toBe(['teacher', 'user']);
});

test('creating a student for an existing user grants the student role again', function () {
    $user = User::factory()->create();
    $user->student->delete();

    $this->actingAs($user)->post(route('admin.student.store'), ['user_id' => $user->id])
        ->assertRedirect(route('admin.student.index'));

    expect($user->fresh()->student)->not->toBeNull()
        ->and($user->fresh()->getRoleNames()->sort()->values()->all())->toBe(['student', 'user']);
});

test('creating a teacher grants the teacher role alongside existing roles', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('admin.teacher.store'), ['user_id' => $user->id])
        ->assertRedirect(route('admin.teacher.index'));

    expect($user->fresh()->teacher)->not->toBeNull()
        ->and($user->fresh()->getRoleNames()->sort()->values()->all())->toBe(['student', 'teacher', 'user']);
});

test('removing a teacher revokes only the teacher role', function () {
    $user = User::factory()->create();
    $teacher = Teacher::factory()->for($user)->create();

    $this->actingAs($user)->delete(route('admin.teacher.destroy', $teacher))
        ->assertRedirect(route('admin.teacher.index'));

    expect($user->fresh()->teacher)->toBeNull()
        ->and($user->fresh()->getRoleNames()->sort()->values()->all())->toBe(['student', 'user']);
});

test('transferring a student transfers only the student role to the new user', function () {
    $previousUser = User::factory()->create();
    $newUser = User::factory()->create();
    $newUser->student->delete();
    $student = $previousUser->student->load('user');

    $student->update(['user_id' => $newUser->id]);

    expect($previousUser->fresh()->getRoleNames()->all())->toBe(['user'])
        ->and($newUser->fresh()->getRoleNames()->sort()->values()->all())->toBe(['student', 'user']);
});

test('transferring a teacher transfers only the teacher role to the new user', function () {
    $previousUser = User::factory()->create();
    $newUser = User::factory()->create();
    $teacher = Teacher::factory()->for($previousUser)->create()->load('user');

    $teacher->update(['user_id' => $newUser->id]);

    expect($previousUser->fresh()->getRoleNames()->sort()->values()->all())->toBe(['student', 'user'])
        ->and($newUser->fresh()->getRoleNames()->sort()->values()->all())->toBe(['student', 'teacher', 'user']);
});
