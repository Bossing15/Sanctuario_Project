<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Service;

class ProductsAndServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Products
        $products = [
            [
                'title' => 'Lawn Lots',
                'slug' => 'lawn-lots',
                'category' => 'Lawn Lots',
                'description' => 'Lawn Lots are the most basic type and at the same time most economical for burial services. They provide a peaceful resting place in our well-maintained lawn areas.',
                'status' => 'Active',
                'price_monthly' => 500,
                'price_quarterly' => 1400,
                'price_yearly' => 5000,
                'discount_percentage' => 0,
            ],
            [
                'title' => 'Family Estates',
                'slug' => 'family-estates',
                'category' => 'Family Estates',
                'description' => 'Family Estates display luxury and exclusivity allowing you to have a private and secure place for your loved ones. These premium plots offer enhanced privacy and elegance.',
                'status' => 'Active',
                'price_monthly' => 1200,
                'price_quarterly' => 3400,
                'price_yearly' => 12000,
                'discount_percentage' => 0,
            ],
            [
                'title' => 'Columbariums',
                'slug' => 'columbariums',
                'category' => 'Columbariums',
                'description' => 'Our indoor and garden columbariums facilities provide settings where you can feel at peace. These modern facilities offer a serene environment for cremated remains.',
                'status' => 'Active',
                'price_monthly' => 800,
                'price_quarterly' => 2200,
                'price_yearly' => 8000,
                'discount_percentage' => 0,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['title' => $product['title']],
                $product
            );
        }

        // Create Services
        $services = [
            [
                'title' => 'Interment Service',
                'slug' => 'interment-service',
                'category' => 'Burial Services',
                'description' => 'Honoring your departed loved ones by giving them a sacred resting place. Our interment services include professional handling and respectful ceremonies.',
                'status' => 'Active',
                'price_monthly' => 2000,
                'price_quarterly' => 5500,
                'price_yearly' => 20000,
                'discount_percentage' => 0,
            ],
            [
                'title' => 'Cremation Service',
                'slug' => 'cremation-service',
                'category' => 'Burial Services',
                'description' => 'At the time to embrace a modern way in the country, we are proud to sponsor our cremation services. Professional and dignified cremation with complete documentation.',
                'status' => 'Active',
                'price_monthly' => 1500,
                'price_quarterly' => 4200,
                'price_yearly' => 15000,
                'discount_percentage' => 0,
            ],
            [
                'title' => 'Grave Painting',
                'slug' => 'grave-painting',
                'category' => 'Grave Maintenance',
                'description' => 'Professional grave painting service to maintain and beautify the resting place of your loved ones.',
                'status' => 'Active',
                'price_monthly' => 300,
                'price_quarterly' => 800,
                'price_yearly' => 3000,
                'discount_percentage' => 0,
            ],
            [
                'title' => 'Grave Restoration',
                'slug' => 'grave-restoration',
                'category' => 'Grave Maintenance',
                'description' => 'Complete grave restoration service including cleaning, repairs, and restoration of monuments and markers.',
                'status' => 'Active',
                'price_monthly' => 500,
                'price_quarterly' => 1400,
                'price_yearly' => 5000,
                'discount_percentage' => 0,
            ],
            [
                'title' => 'Grave Cleaning',
                'slug' => 'grave-cleaning',
                'category' => 'Grave Maintenance',
                'description' => 'Regular grave cleaning and maintenance service to keep the resting place clean and well-maintained.',
                'status' => 'Active',
                'price_monthly' => 200,
                'price_quarterly' => 500,
                'price_yearly' => 2000,
                'discount_percentage' => 0,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['title' => $service['title']],
                $service
            );
        }

        $this->command->info('Products and Services seeded successfully!');
    }
}
