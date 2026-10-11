<?php

use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('guests receive empty roles and permissions', function () {
    $this->get(route('login'))->assertInertia(fn (Assert $page) => $page
        ->where('auth.user', null)
        ->where('auth.roles', [])
        ->where('auth.permissions', [])
    );
});

test('users without roles or permissions receive empty lists', function () {
    $user = User::factory()->create();
    $user->syncRoles([]);

    $this->actingAs($user)->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
        ->where('auth.user.id', $user->id)
        ->where('auth.user.wallet.user_id', $user->id)
        ->missing('auth.user.password')
        ->where('auth.roles', [])
        ->where('auth.permissions', [])
    );
});

test('users receive their role names and all their unique permission names', function () {
    $user = User::factory()->create();
    $role = Role::create(['name' => 'editor', 'guard_name' => 'web']);
    $rolePermission = Permission::create(['name' => 'courses.edit', 'guard_name' => 'web']);
    $directPermission = Permission::create(['name' => 'courses.view', 'guard_name' => 'web']);
    $unassignedPermission = Permission::create(['name' => 'users.delete', 'guard_name' => 'web']);
    $role->givePermissionTo($rolePermission);
    $user->assignRole($role);
    $user->givePermissionTo($directPermission, $rolePermission);
    $otherUser = User::factory()->create();
    $otherRole = Role::create(['name' => 'admin', 'guard_name' => 'web']);
    $otherRole->givePermissionTo($unassignedPermission);
    $otherUser->assignRole($otherRole);

    $this->actingAs($user)->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
        ->where('auth.user.id', $user->id)
        ->has('auth.roles', 3)
        ->where('auth.roles', fn (Collection $roles): bool => $roles->sort()->values()->all() === ['editor', 'student', 'user'])
        ->has('auth.permissions', 2)
        ->where('auth.permissions', fn (Collection $permissions): bool => $permissions->sort()->values()->all() === ['courses.edit', 'courses.view'])
    );
});
