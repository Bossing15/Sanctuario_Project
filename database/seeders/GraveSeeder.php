<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Grave;
use App\Models\Client;

class GraveSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get existing clients to associate with graves
        $clients = Client::all();
        
        if ($clients->count() < 5) {
            $this->command->warn('Not enough clients in database. Please run ClientSeeder first.');
            return;
        }

        $graves = [
            [
                'deceased_name' => 'Mia',
                'section' => 'A',
                'plot_number' => '12',
                'grave_location' => 'Section A, Plot 12',
                'client_id' => $clients[0]->id, // Maria Dela Cruz
                'relationship_to_deceased' => 'Wife',
                'status' => 'Active',
                'burial_date' => '2010-01-01',
                'notes' => 'Regular maintenance required',
            ],
            [
                'deceased_name' => 'Zane',
                'section' => 'B',
                'plot_number' => '13',
                'grave_location' => 'Section B, Plot 13',
                'client_id' => $clients[1]->id, // Robert Reyes
                'relationship_to_deceased' => 'Son',
                'status' => 'Active',
                'burial_date' => '2020-02-04',
                'notes' => 'Memorial flowers weekly',
            ],
            [
                'deceased_name' => 'Leo',
                'section' => 'C',
                'plot_number' => '14',
                'grave_location' => 'Section C, Plot 14',
                'client_id' => $clients[2]->id, // Angelica Gomez
                'relationship_to_deceased' => 'Daughter',
                'status' => 'Active',
                'burial_date' => '2023-03-05',
                'notes' => 'Recent burial, special care needed',
            ],
            [
                'deceased_name' => 'Ava',
                'section' => 'D',
                'plot_number' => '15',
                'grave_location' => 'Section D, Plot 15',
                'client_id' => $clients[3]->id, // Daniel Ortega
                'relationship_to_deceased' => 'Husband',
                'status' => 'Active',
                'burial_date' => '2024-04-04',
                'notes' => 'Premium maintenance package',
            ],
            [
                'deceased_name' => 'Max',
                'section' => 'E',
                'plot_number' => '16',
                'grave_location' => 'Section E, Plot 16',
                'client_id' => $clients[4]->id, // Kristine Santos
                'relationship_to_deceased' => 'Mother',
                'status' => 'Active',
                'burial_date' => '2021-05-04',
                'notes' => 'Monthly cleaning service',
            ],
        ];

        // Create additional graves for demonstration
        $additionalGraves = [
            [
                'deceased_name' => 'Ivy',
                'section' => 'A',
                'plot_number' => '17',
                'grave_location' => 'Section A, Plot 17',
                'client_id' => $clients[0]->id, // Can have multiple graves
                'relationship_to_deceased' => 'Father',
                'status' => 'Inactive',
                'burial_date' => '2015-06-07',
                'notes' => 'Payment overdue',
            ],
            [
                'deceased_name' => 'Zoe',
                'section' => 'B',
                'plot_number' => '18',
                'grave_location' => 'Section B, Plot 18',
                'client_id' => $clients[1]->id,
                'relationship_to_deceased' => 'Sister',
                'status' => 'Inactive',
                'burial_date' => '2003-07-02',
                'notes' => 'Maintenance suspended',
            ],
            [
                'deceased_name' => 'Kai',
                'section' => 'C',
                'plot_number' => '20',
                'grave_location' => 'Section C, Plot 20',
                'client_id' => $clients[2]->id,
                'relationship_to_deceased' => 'Brother',
                'status' => 'Inactive',
                'burial_date' => '2001-08-05',
                'notes' => 'Contact client for renewal',
            ],
            [
                'deceased_name' => 'Liv',
                'section' => 'D',
                'plot_number' => '21',
                'grave_location' => 'Section D, Plot 21',
                'client_id' => $clients[3]->id,
                'relationship_to_deceased' => 'Daughter',
                'status' => 'Inactive',
                'burial_date' => '2020-09-01',
                'notes' => 'Service discontinued',
            ],
            [
                'deceased_name' => 'Mat',
                'section' => 'E',
                'plot_number' => '22',
                'grave_location' => 'Section E, Plot 22',
                'client_id' => $clients[4]->id,
                'relationship_to_deceased' => 'Son',
                'status' => 'Inactive',
                'burial_date' => '2025-10-08',
                'notes' => 'Future burial planned',
            ],
        ];

        // Combine all graves
        $allGraves = array_merge($graves, $additionalGraves);

        foreach ($allGraves as $graveData) {
            Grave::create($graveData);
        }

        $this->command->info('Created ' . count($allGraves) . ' graves successfully!');
    }
}