<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['admin', 'user', 'student', 'teacher'] as $roleName) {
            Role::findOrCreate($roleName, 'web');
        }
    }
}
