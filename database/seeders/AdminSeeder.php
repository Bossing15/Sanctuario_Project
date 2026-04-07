<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Admin::create([
            'name' => 'Super Admin',
            'username' => 'admin',
            'email' => 'admin@sanctuario.com',
            'password' => 'admin123',
            'department' => 'Administration',
            'position' => 'System Administrator',
            'access_level' => 'super_admin',
            'is_active' => true,
        ]);

        \App\Models\Admin::create([
            'name' => 'John Admin',
            'username' => 'john',
            'email' => 'john@sanctuario.com',
            'password' => 'password123',
            'department' => 'Operations',
            'position' => 'Manager',
            'access_level' => 'admin',
            'is_active' => true,
        ]);
    }
}
