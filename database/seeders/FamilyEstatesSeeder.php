<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FamilyEstate;

class FamilyEstatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create family estates with 1 section, 25 estates
        $section = 'Main';
        
        for ($i = 1; $i <= 25; $i++) {
            FamilyEstate::create([
                'plot_number' => 'FE-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'section' => $section,
                'location' => 'Main - Estate ' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'status' => 'Inactive', // Inactive = available
                'deceased_name' => 'Available',
            ]);
        }
    }
}
