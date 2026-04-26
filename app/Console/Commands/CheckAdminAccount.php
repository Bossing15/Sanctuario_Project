<?php

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CheckAdminAccount extends Command
{
    protected $signature = 'admin:check';
    protected $description = 'Check and fix admin account';

    public function handle()
    {
        $this->info('Checking admin accounts...');
        $this->info('');

        // Check if any admins exist
        $admins = Admin::all();
        $this->info("Total admin accounts: " . $admins->count());
        $this->info('');

        if ($admins->count() > 0) {
            $this->info('Existing admin accounts:');
            $this->info('─────────────────────────────────────');
            foreach ($admins as $admin) {
                $this->info("ID: {$admin->id}");
                $this->info("Name: {$admin->name}");
                $this->info("Email: {$admin->email}");
                $this->info("Username: {$admin->username}");
                $this->info("Access Level: {$admin->access_level}");
                $this->info("Active: " . ($admin->is_active ? 'Yes' : 'No'));
                $this->info('─────────────────────────────────────');
            }
        } else {
            $this->warn('No admin accounts found!');
            $this->info('Creating fresh admin account...');
            
            // Disable foreign key checks
            \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            
            // Create admin
            $admin = Admin::create([
                'name' => 'Administrator',
                'email' => 'admin@sanctuario.com',
                'password' => Hash::make('admin123'),
                'username' => 'admin',
                'access_level' => 'admin',
                'is_active' => true,
            ]);
            
            // Re-enable foreign key checks
            \DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            
            $this->info('✅ Admin account created!');
            $this->info('');
            $this->info('Login with:');
            $this->info("Username: {$admin->username}");
            $this->info("Password: admin123");
        }

        return 0;
    }
}
