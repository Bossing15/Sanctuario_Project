<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, let's get all users from the users table
        $users = \DB::table('users')->get();
        
        foreach ($users as $user) {
            if ($user->role === 'client') {
                // Migrate client users to clients table
                \DB::table('clients')->insert([
                    'name' => $user->name,
                    'email' => $user->email,
                    'password' => $user->password,
                    'username' => $user->email, // Use email as username for existing users
                    'deceased_name' => null,
                    'grave_location' => null,
                    'address' => null,
                    'plot_number' => null,
                    'phone' => null,
                    'date_of_burial' => null,
                    'relationship' => null,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]);
            } elseif ($user->role === 'admin') {
                // Migrate admin users to admins table (if not already there)
                $existingAdmin = \DB::table('admins')->where('email', $user->email)->first();
                if (!$existingAdmin) {
                    \DB::table('admins')->insert([
                        'name' => $user->name,
                        'email' => $user->email,
                        'password' => $user->password,
                        'department' => 'Administration',
                        'position' => 'Administrator',
                        'access_level' => 'admin',
                        'is_active' => true,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,
                    ]);
                }
            }
        }

        // Add the specific client with username jamestojon2@gmail.com if not exists
        $existingClient = \DB::table('clients')->where('email', 'jamestojon2@gmail.com')->first();
        if (!$existingClient) {
            \DB::table('clients')->insert([
                'name' => 'James Tojon',
                'email' => 'jamestojon2@gmail.com',
                'password' => \Hash::make('password123'),
                'username' => 'jamestojon2@gmail.com',
                'deceased_name' => 'Sample Deceased',
                'grave_location' => 'Garden of Peace',
                'address' => 'Sample Address',
                'plot_number' => 'A-001',
                'phone' => '+63912345678',
                'date_of_burial' => '2024-01-01',
                'relationship' => 'Son',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Drop the users table
        Schema::dropIfExists('users');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate users table if needed for rollback
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role')->default('client');
            $table->json('profile_data')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }
};
