<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Property;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample products (only products, not services)
        // NOTE: Interment and Cremation are SERVICES, not products
        // They are created in the MaintenanceServiceSeeder
        
        Property::firstOrCreate(
            ['slug' => 'lawn-lots'],
            [
                'title' => 'Lawn Lots',
                'description' => 'Beautiful garden-style burial spaces for your loved one',
                'price_monthly' => 5000,
                'price_quarterly' => 14000,
                'price_yearly' => 50000,
                'status' => 'active',
            ]
        );

        Property::firstOrCreate(
            ['slug' => 'family-estates'],
            [
                'title' => 'Family Estates',
                'description' => 'Spacious family burial grounds',
                'price_monthly' => 8000,
                'price_quarterly' => 22000,
                'price_yearly' => 80000,
                'status' => 'active',
            ]
        );

        Property::firstOrCreate(
            ['slug' => 'columbariums'],
            [
                'title' => 'Columbariums',
                'description' => 'Elegant above-ground niches',
                'price_monthly' => 3000,
                'price_quarterly' => 8500,
                'price_yearly' => 30000,
                'status' => 'active',
            ]
        );
    }
}
