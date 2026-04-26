<?php

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetAdminAccounts extends Command
{
    protected $signature = 'admin:reset';
    protected $description = 'Delete all admin accounts and create a fresh admin account';

    public function handle()
    {
        $this->info('Starting admin account reset...');

        // Disable foreign key checks
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Delete all existing admin accounts
        $count = Admin::count();
        Admin::truncate();
        $this->info("Deleted {$count} admin accounts");

        // Re-enable foreign key checks
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create fresh admin account
        $admin = Admin::create([
            'name' => 'Administrator',
            'email' => 'admin@sanctuario.com',
            'password' => Hash::make('admin123'),
            'username' => 'admin',
            'access_level' => 'admin',
            'is_active' => true,
        ]);

        $this->info('✅ Fresh admin account created successfully!');
        $this->info('');
        $this->info('Admin Account Details:');
        $this->info('─────────────────────────────────────');
        $this->info("Email: {$admin->email}");
        $this->info("Username: {$admin->username}");
        $this->info("Password: admin123");
        $this->info("Access Level: {$admin->access_level}");
        $this->info('─────────────────────────────────────');
        $this->info('');
        $this->warn('⚠️  Please change the password after first login!');

        return 0;
    }
}
