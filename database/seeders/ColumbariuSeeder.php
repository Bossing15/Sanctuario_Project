<?php

namespace Database\Seeders;

use App\Models\Columbarium;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ColumbariuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define columbarium with 500 niches in one location
        $lotsPerLocation = 500;
        $locationName = 'Columbarium';

        // Define niche sections and their properties
        $sections = [
            'Standard' => ['color' => '#FFB6C1', 'percentage' => 0.40],      // 40% = 200 niches
            'Deluxe' => ['color' => '#87CEEB', 'percentage' => 0.30],        // 30% = 150 niches
            'Premium' => ['color' => '#FFD700', 'percentage' => 0.20],       // 20% = 100 niches
            'Super Premium' => ['color' => '#8B7355', 'percentage' => 0.10], // 10% = 50 niches
        ];

        $defaultClientId = 1;
        $totalNichesCreated = 0;
        $plotNumber = 1;

        foreach ($sections as $section => $config) {
            $nichesInSection = (int)($lotsPerLocation * $config['percentage']);
            
            for ($i = 1; $i <= $nichesInSection; $i++) {
                $nichNumberFormatted = 'NICHE-' . str_pad($plotNumber, 4, '0', STR_PAD_LEFT);
                
                // Check if niche already exists
                $exists = Columbarium::where('niche_number', $nichNumberFormatted)->exists();
                
                if (!$exists) {
                    Columbarium::create([
                        'niche_number' => $nichNumberFormatted,
                        'location' => $locationName . ' - Section ' . $section . ' - Row ' . ceil($i / 10) . ' - Niche ' . (($i - 1) % 10 + 1),
                        'section' => $section,
                        'status' => 'Inactive', // Use 'Inactive' to indicate available
                        'client_id' => $defaultClientId,
                        'deceased_name' => 'Available',
                        'relationship_to_deceased' => 'N/A',
                        'burial_date' => null,
                        'notes' => 'Available for purchase',
                    ]);
                    $totalNichesCreated++;
                }

                $plotNumber++;
            }
        }

        $this->command->info('Columbarium niches seeded successfully! Total: ' . $totalNichesCreated . ' niches');
    }
}
