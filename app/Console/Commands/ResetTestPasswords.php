<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class ResetTestPasswords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reset:test-passwords';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset test user passwords';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $password = Hash::make('password123');
        $adminPassword = Hash::make('admin123');
        $superAdminPassword = Hash::make('Admin@2024');
        
        Client::where('email', 'test@example.com')->update(['password' => $password]);
        Client::where('email', 'john@example.com')->update(['password' => $password]);
        
        // Reset admin passwords
        Admin::where('username', 'admin')->update(['password' => $adminPassword]);
        Admin::where('username', 'john')->update(['password' => $password]);
        Admin::where('username', 'superadmin')->update(['password' => $superAdminPassword]);
        
        $this->info('Test passwords reset successfully!');
        $this->info('');
        $this->info('Admin credentials:');
        $this->info('  Username: admin');
        $this->info('  Password: admin123');
        $this->info('');
        $this->info('  Username: john');
        $this->info('  Password: password123');
        $this->info('');
        $this->info('Super Admin credentials:');
        $this->info('  Username: superadmin');
        $this->info('  Password: Admin@2024');
    }
}
