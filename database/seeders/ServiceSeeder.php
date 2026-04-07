<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'title' => 'Grave Maintenance',
                'slug' => 'grave-maintenance',
                'category' => 'Grave Maintenance',
                'description' => 'Trusted to perfection, every step. Our Grave Maintenance service provides respectful and thorough bundle of care, including diligent cleaning, precise grass cutting, careful flower watering, and complete debris removal. We ensure existing is treated with the care it deserves. We trim the grass evenly, apply fertilizer to maintain a vibrant growth, remove debris, sweep the area clean, and treat the gravesite with the honor it deserves. The result is a pristine memorial that families can visit with comfort and pride.',
                'image_path' => 'uploads/services/grave-maintenance.webp',
                'price_monthly' => 800.00,
                'price_quarterly' => 2400.00,
                'price_yearly' => 9600.00,
                'status' => 'Active',
            ],
            [
                'title' => 'Grave Repainting',
                'slug' => 'grave-repainting',
                'category' => 'Grave Maintenance',
                'description' => 'Restore with dignity, painted with care. Our Grave Repainting service ensures that the final resting place of your loved ones remains in pristine condition. We provide professional repainting services to preserve the dignity and beauty of the memorial site.',
                'image_path' => 'uploads/services/grave-repainting.jpg',
                'price_monthly' => 1000.00,
                'price_quarterly' => 3000.00,
                'price_yearly' => 12000.00,
                'status' => 'Active',
            ],
            [
                'title' => 'Grave Restoration',
                'slug' => 'grave-restoration',
                'category' => 'Grave Maintenance',
                'description' => 'Bringing honor through proper restoration. Our Grave Restoration service focuses on the preservation and maintenance of headstones, monuments, and other memorial structures. We clean, polish, and protect these important tributes to ensure they remain beautiful and legible for generations to come.',
                'image_path' => 'uploads/services/grave-restoration.jpg',
                'price_monthly' => 1200.00,
                'price_quarterly' => 3600.00,
                'price_yearly' => 14400.00,
                'status' => 'Active',
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['slug' => $service['slug']],
                $service
            );
        }
    }
}
