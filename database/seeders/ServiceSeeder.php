<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create core burial services
        Service::firstOrCreate(
            ['slug' => 'interment-service'],
            [
                'title' => 'Interment Service',
                'description' => 'Honoring your departed loved ones with professional interment services',
                'category' => 'Burial Services',
                'price_monthly' => 6000,
                'price_quarterly' => 17000,
                'price_yearly' => 60000,
                'status' => 'active',
            ]
        );

        Service::firstOrCreate(
            ['slug' => 'cremation-service'],
            [
                'title' => 'Cremation Service',
                'description' => 'Respectful cremation services for your loved ones',
                'category' => 'Burial Services',
                'price_monthly' => 4000,
                'price_quarterly' => 11000,
                'price_yearly' => 40000,
                'status' => 'active',
            ]
        );

        // Create grave maintenance services
        Service::firstOrCreate(
            ['slug' => 'grave-cleaning'],
            [
                'title' => 'Grave Cleaning',
                'description' => 'Professional cleaning and maintenance of grave sites to keep them looking respectful and well-maintained.',
                'category' => 'Grave Maintenance',
                'price_monthly' => 500.00,
                'price_quarterly' => 1400.00,
                'price_yearly' => 5500.00,
                'status' => 'active',
            ]
        );

        Service::firstOrCreate(
            ['slug' => 'grave-painting'],
            [
                'title' => 'Grave Painting',
                'description' => 'Professional repainting and restoration of grave markers and monuments to maintain their appearance and protect against weathering.',
                'category' => 'Grave Maintenance',
                'price_monthly' => 800.00,
                'price_quarterly' => 2200.00,
                'price_yearly' => 8500.00,
                'status' => 'active',
            ]
        );

        Service::firstOrCreate(
            ['slug' => 'grave-restoration'],
            [
                'title' => 'Grave Restoration',
                'description' => 'Comprehensive restoration service including structural repairs, stone replacement, and complete refurbishment of grave sites.',
                'category' => 'Grave Maintenance',
                'price_monthly' => 1200.00,
                'price_quarterly' => 3300.00,
                'price_yearly' => 12000.00,
                'status' => 'active',
            ]
        );
    }
}
