<?php

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetAdminPassword extends Command
{
    protected $signature = 'admin:reset-password {username=admin} {password=admin123}';
    protected $description = 'Reset admin password';

    public function handle()
    {
        $username = $this->argument('username');
        $password = $this->argument('password');

        $admin = Admin::where('username', $username)->first();

        if (!$admin) {
            $this->error("Admin with username '{$username}' not found!");
            return 1;
        }

        // Update password
        $admin->password = Hash::make($password);
        $admin->save();

        $this->info('✅ Password reset successfully!');
        $this->info('');
        $this->info('Login with:');
        $this->info("Username: {$admin->username}");
        $this->info("Password: {$password}");

        return 0;
    }
}
