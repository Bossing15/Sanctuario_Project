<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class TestClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test client account
        Client::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password123'),
                'phone' => '09123456789',
                'address' => '123 Test Street',
                'deceased_name' => 'John Doe',
                'relationship' => 'Father',
            ]
        );

        // Create another test client
        Client::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'email' => 'demo@example.com',
                'password' => Hash::make('demo1234'),
                'phone' => '09987654321',
                'address' => '456 Demo Avenue',
                'deceased_name' => 'Jane Smith',
                'relationship' => 'Mother',
            ]
        );

        echo "Test clients created successfully!\n";
        echo "Test Account 1:\n";
        echo "  Email: test@example.com\n";
        echo "  Password: password123\n";
        echo "\nTest Account 2:\n";
        echo "  Email: demo@example.com\n";
        echo "  Password: demo1234\n";
    }
}
