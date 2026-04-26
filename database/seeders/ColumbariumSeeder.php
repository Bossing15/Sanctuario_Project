<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Columbarium;

class ColumbariumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Columbariums: 1 section with 25 niches
        $section = 'Main Hall';
        for ($i = 1; $i <= 25; $i++) {
            Columbarium::firstOrCreate(
                ['niche_number' => 'C-' . str_pad($i, 3, '0', STR_PAD_LEFT)],
                [
                    'section' => $section,
                    'location' => $section . ' - Niche ' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'status' => 'Inactive', // Inactive = available
                    'deceased_name' => 'Available',
                ]
            );
        }
    }
}
