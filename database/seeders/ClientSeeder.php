<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $clients = [
            [
                'name' => 'Maria Dela Cruz',
                'email' => 'maria.delacruz@email.com',
                'username' => 'maria_dc',
                'password' => Hash::make('password123'),
                'phone' => '0917-123-4567',
                'address' => '123 Sampaguita Street, Carmona, Cavite',
                'deceased_name' => 'Juan Dela Cruz',
                'relationship' => 'Wife',
                'grave_location' => 'Section A, Row 5',
                'plot_number' => 'A-005',
                'date_of_burial' => '2024-03-15',
            ],
            [
                'name' => 'Robert Reyes',
                'email' => 'robert.reyes@email.com',
                'username' => 'robert_r',
                'password' => Hash::make('password123'),
                'phone' => '0922-456-7890',
                'address' => '456 Rose Avenue, Carmona, Cavite',
                'deceased_name' => 'Elena Reyes',
                'relationship' => 'Son',
                'grave_location' => 'Section B, Row 2',
                'plot_number' => 'B-002',
                'date_of_burial' => '2024-01-20',
            ],
            [
                'name' => 'Angelica Gomez',
                'email' => 'angelica.gomez@email.com',
                'username' => 'angel_g',
                'password' => Hash::make('password123'),
                'phone' => '0918-555-6789',
                'address' => '789 Lily Street, Carmona, Cavite',
                'deceased_name' => 'Carlos Gomez',
                'relationship' => 'Daughter',
                'grave_location' => 'Section C, Row 1',
                'plot_number' => 'C-001',
                'date_of_burial' => '2024-05-10',
            ],
            [
                'name' => 'Daniel Ortega',
                'email' => 'daniel.ortega@email.com',
                'username' => 'daniel_o',
                'password' => Hash::make('password123'),
                'phone' => '0905-888-9999',
                'address' => '321 Jasmine Road, Carmona, Cavite',
                'deceased_name' => 'Rosa Ortega',
                'relationship' => 'Son',
                'grave_location' => 'Section A, Row 8',
                'plot_number' => 'A-008',
                'date_of_burial' => '2023-12-05',
            ],
            [
                'name' => 'Kristine Santos',
                'email' => 'kristine.santos@email.com',
                'username' => 'kris_s',
                'password' => Hash::make('password123'),
                'phone' => '0933-222-4444',
                'address' => '654 Orchid Lane, Carmona, Cavite',
                'deceased_name' => 'Miguel Santos',
                'relationship' => 'Wife',
                'grave_location' => 'Section B, Row 7',
                'plot_number' => 'B-007',
                'date_of_burial' => '2024-02-28',
            ],
        ];

        foreach ($clients as $clientData) {
            Client::create($clientData);
        }
    }
}