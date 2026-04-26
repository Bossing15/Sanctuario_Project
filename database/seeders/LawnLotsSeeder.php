<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\LawnLot;

class LawnLotsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lawn Lots: 2 sections with 500 lots each
        $sections = ['Section A', 'Section B'];
        $plotNumber = 1;
        
        foreach ($sections as $section) {
            for ($i = 0; $i < 500; $i++) {
                LawnLot::firstOrCreate(
                    ['plot_number' => 'L-' . str_pad($plotNumber, 5, '0', STR_PAD_LEFT)],
                    [
                        'section' => $section,
                        'grave_location' => $section . ' - Plot ' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                        'status' => 'Inactive', // Inactive = available
                        'deceased_name' => 'Available',
                    ]
                );
                $plotNumber++;
            }
        }
    }
}
