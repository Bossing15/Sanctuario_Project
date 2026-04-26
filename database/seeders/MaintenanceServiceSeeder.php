<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MaintenanceServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('services')->insertOrIgnore([
            [
                'title' => 'Grave Painting',
                'description' => 'Professional repainting and restoration of grave markers and monuments to maintain their appearance and protect against weathering.',
                'category' => 'Grave Maintenance',
                'price_monthly' => 800.00,
                'price_quarterly' => 2200.00,
                'price_yearly' => 8500.00,
                'discount_percentage' => 0,
                'status' => 'Active',
                'image_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Grave Restoration',
                'description' => 'Comprehensive restoration service including structural repairs, stone replacement, and complete refurbishment of grave sites.',
                'category' => 'Grave Maintenance',
                'price_monthly' => 1200.00,
                'price_quarterly' => 3300.00,
                'price_yearly' => 12000.00,
                'discount_percentage' => 0,
                'status' => 'Active',
                'image_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
