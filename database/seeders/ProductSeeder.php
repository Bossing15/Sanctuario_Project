<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::create([
            'title' => 'Lawn Lots',
            'slug' => 'lawn-lots',
            'category' => 'Products',
            'description' => 'Lawn Lots are the most basic type and at the same time most economical for burial spaces. These are perfect for families looking for an affordable yet dignified resting place.',
            'image_path' => null,
            'gallery_images' => null,
            'price_monthly' => 5000,
            'price_quarterly' => 14000,
            'price_yearly' => 50000,
            'discount_percentage' => null,
            'pricing_title' => null,
            'pricing_subtitle' => null,
            'package_title' => null,
            'package_description' => null,
            'package_note' => null,
            'status' => 'active',
        ]);

        Product::create([
            'title' => 'Family Estates',
            'slug' => 'family-estates',
            'category' => 'Products',
            'description' => 'Family Estates display luxury and exclusivity allowing you to have a private and secure place for your family members. These spacious grounds provide a serene environment for remembrance.',
            'image_path' => null,
            'gallery_images' => null,
            'price_monthly' => 8000,
            'price_quarterly' => 22000,
            'price_yearly' => 80000,
            'discount_percentage' => null,
            'pricing_title' => null,
            'pricing_subtitle' => null,
            'package_title' => null,
            'package_description' => null,
            'package_note' => null,
            'status' => 'active',
        ]);

        Product::create([
            'title' => 'Columbariums',
            'slug' => 'columbariums',
            'category' => 'Products',
            'description' => 'Our indoor and garden columbariums facilities provide settings where you can feel at peace. These elegant above-ground niches offer a modern alternative for cremation remains.',
            'image_path' => null,
            'gallery_images' => null,
            'price_monthly' => 6000,
            'price_quarterly' => 17000,
            'price_yearly' => 60000,
            'discount_percentage' => null,
            'pricing_title' => null,
            'pricing_subtitle' => null,
            'package_title' => null,
            'package_description' => null,
            'package_note' => null,
            'status' => 'active',
        ]);

        Product::create([
            'title' => 'Interment',
            'slug' => 'interment',
            'category' => 'Products',
            'description' => 'Honoring your departed loved ones by providing them a sacred resting place. Our interment packages provide for every family\'s needs.',
            'image_path' => null,
            'gallery_images' => null,
            'price_monthly' => 7000,
            'price_quarterly' => 19000,
            'price_yearly' => 70000,
            'discount_percentage' => null,
            'pricing_title' => null,
            'pricing_subtitle' => null,
            'package_title' => null,
            'package_description' => null,
            'package_note' => null,
            'status' => 'active',
        ]);

        Product::create([
            'title' => 'Cremation',
            'slug' => 'cremation',
            'category' => 'Products',
            'description' => 'We are proud to offer our cremation services with dignity and respect for your loved ones. A modern way to honor those who have passed.',
            'image_path' => null,
            'gallery_images' => null,
            'price_monthly' => 4500,
            'price_quarterly' => 12500,
            'price_yearly' => 45000,
            'discount_percentage' => null,
            'pricing_title' => null,
            'pricing_subtitle' => null,
            'package_title' => null,
            'package_description' => null,
            'package_note' => null,
            'status' => 'active',
        ]);
    }
}
