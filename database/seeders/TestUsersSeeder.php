<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test client user
        Client::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'testuser',
            'phone' => '09123456789',
            'password' => Hash::make('password123'),
        ]);

        // Create another test user
        Client::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'username' => 'johndoe',
            'phone' => '09987654321',
            'password' => Hash::make('password123'),
        ]);
    }
}
