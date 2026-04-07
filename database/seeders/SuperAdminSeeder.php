<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if super admin already exists
        $existingAdmin = Admin::where('email', 'superadmin@sanctuario.com')->first();
        
        if ($existingAdmin) {
            // Update username if it doesn't have one
            if (!$existingAdmin->username) {
                $existingAdmin->update(['username' => 'superadmin']);
                $this->command->info('Super Admin username updated!');
            }
            $this->command->info('Super Admin already exists!');
            return;
        }

        // Create Super Admin
        Admin::create([
            'name' => 'Super Administrator',
            'username' => 'superadmin',
            'email' => 'superadmin@sanctuario.com',
            'password' => Hash::make('Admin@2024'),
            'department' => 'Management',
            'position' => 'Super Administrator',
            'access_level' => 'super_admin',
            'is_active' => true,
        ]);

        $this->command->info('Super Admin created successfully!');
        $this->command->info('Username: superadmin');
        $this->command->info('Password: Admin@2024');
    }
}
