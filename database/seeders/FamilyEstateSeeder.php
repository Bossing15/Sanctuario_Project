<?php

namespace Database\Seeders;

use App\Models\FamilyEstate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FamilyEstateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define family estates with 20 plots in one location
        $lotsPerLocation = 20;
        $locationName = 'Family Estate';

        // Define estate sections and their properties
        $sections = [
            'Standard' => ['color' => '#FFB6C1', 'percentage' => 0.40],      // 40% = 8 estates
            'Deluxe' => ['color' => '#87CEEB', 'percentage' => 0.30],        // 30% = 6 estates
            'Premium' => ['color' => '#FFD700', 'percentage' => 0.20],       // 20% = 4 estates
            'Super Premium' => ['color' => '#8B7355', 'percentage' => 0.10], // 10% = 2 estates
        ];

        $defaultClientId = 1;
        $totalEstatesCreated = 0;
        $plotNumber = 1;

        foreach ($sections as $section => $config) {
            $estatesInSection = (int)($lotsPerLocation * $config['percentage']);
            
            for ($i = 1; $i <= $estatesInSection; $i++) {
                $plotNumberFormatted = 'ESTATE-' . str_pad($plotNumber, 3, '0', STR_PAD_LEFT);
                
                // Check if estate already exists
                $exists = FamilyEstate::where('plot_number', $plotNumberFormatted)->exists();
                
                if (!$exists) {
                    FamilyEstate::create([
                        'plot_number' => $plotNumberFormatted,
                        'location' => $locationName . ' - Section ' . $section . ' - Plot ' . $i,
                        'section' => $section,
                        'status' => 'Inactive', // Use 'Inactive' to indicate available
                        'client_id' => $defaultClientId,
                        'deceased_name' => 'Available',
                        'relationship_to_deceased' => 'N/A',
                        'burial_date' => null,
                        'notes' => 'Available for purchase',
                    ]);
                    $totalEstatesCreated++;
                }

                $plotNumber++;
            }
        }

        $this->command->info('Family estates seeded successfully! Total: ' . $totalEstatesCreated . ' estates');
    }
}
