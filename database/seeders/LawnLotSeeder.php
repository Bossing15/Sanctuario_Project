<?php

namespace Database\Seeders;

use App\Models\LawnLot;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LawnLotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define two locations with 500 lots each
        $locations = [
            'A' => 500,
            'B' => 500,
        ];

        // Define lawn lot sections and their properties
        $sections = [
            'Standard' => ['color' => '#FFB6C1', 'percentage' => 0.40],      // 40% = 200 lots per location
            'Deluxe' => ['color' => '#87CEEB', 'percentage' => 0.30],        // 30% = 150 lots per location
            'Premium' => ['color' => '#FFD700', 'percentage' => 0.20],       // 20% = 100 lots per location
            'Super Premium' => ['color' => '#8B7355', 'percentage' => 0.10], // 10% = 50 lots per location
        ];

        $defaultClientId = 1;
        $totalLotsCreated = 0;

        foreach ($locations as $locationCode => $lotsPerLocation) {
            $locationName = 'Location ' . $locationCode;
            $plotNumber = 1;

            foreach ($sections as $section => $config) {
                $lotsInSection = (int)($lotsPerLocation * $config['percentage']);
                
                for ($i = 1; $i <= $lotsInSection; $i++) {
                    $plotNumberFormatted = 'LOT-' . $locationCode . '-' . str_pad($plotNumber, 4, '0', STR_PAD_LEFT);
                    
                    // Check if lot already exists
                    $exists = LawnLot::where('plot_number', $plotNumberFormatted)->exists();
                    
                    if (!$exists) {
                        LawnLot::create([
                            'plot_number' => $plotNumberFormatted,
                            'grave_location' => $locationName . ' - Section ' . $section . ' - Row ' . ceil($i / 10) . ' - Lot ' . (($i - 1) % 10 + 1),
                            'section' => $section,
                            'status' => 'Inactive', // Use 'Inactive' to indicate available
                            'client_id' => $defaultClientId,
                            'deceased_name' => 'Available',
                            'relationship_to_deceased' => 'N/A',
                            'burial_date' => null,
                            'notes' => 'Available for purchase',
                        ]);
                        $totalLotsCreated++;
                    }

                    $plotNumber++;
                }
            }
        }

        $this->command->info('Lawn lots seeded successfully! Total: ' . $totalLotsCreated . ' lots (500 per location)');
    }
}
