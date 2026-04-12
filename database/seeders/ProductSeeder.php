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
            'price_monthly' => null,
            'price_quarterly' => null,
            'price_yearly' => null,
            'discount_percentage' => null,
            'pricing_title' => null,
            'pricing_subtitle' => null,
            'package_title' => null,
            'package_description' => null,
            'package_note' => null,
            'status' => 'Active',
        ]);

        Product::create([
            'title' => 'Family Estates',
            'slug' => 'family-estates',
            'category' => 'Products',
            'description' => 'Family Estates display luxury and exclusivity allowing you to have a private and secure place for your family members. These spacious grounds provide a serene environment for remembrance.',
            'image_path' => null,
            'gallery_images' => null,
            'price_monthly' => null,
            'price_quarterly' => null,
            'price_yearly' => null,
            'discount_percentage' => null,
            'pricing_title' => null,
            'pricing_subtitle' => null,
            'package_title' => null,
            'package_description' => null,
            'package_note' => null,
            'status' => 'Active',
        ]);

        Product::create([
            'title' => 'Columbariums',
            'slug' => 'columbariums',
            'category' => 'Products',
            'description' => 'Our indoor and garden columbariums facilities provide settings where you can feel at peace. These elegant above-ground niches offer a modern alternative for cremation remains.',
            'image_path' => null,
            'gallery_images' => null,
            'price_monthly' => null,
            'price_quarterly' => null,
            'price_yearly' => null,
            'discount_percentage' => null,
            'pricing_title' => null,
            'pricing_subtitle' => null,
            'package_title' => null,
            'package_description' => null,
            'package_note' => null,
            'status' => 'Active',
        ]);
    }
}
