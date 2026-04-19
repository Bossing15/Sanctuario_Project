<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add images to services based on title
        $serviceImages = [
            'Grave Maintenance' => 'services/maintenance.jpg',
            'Interment' => 'services/interment.jpg',
            'Cremation' => 'services/cremation.jpg',
        ];

        foreach ($serviceImages as $title => $imagePath) {
            DB::table('services')
                ->where('title', $title)
                ->update(['image_path' => $imagePath]);
        }

        // Add images to products based on title
        $productImages = [
            'Lawn Lots' => 'products/lawn_lots.jpg',
            'Family Estates' => 'products/family_estates.jpg',
            'Columbariums' => 'products/columbariums.jpg',
        ];

        foreach ($productImages as $title => $imagePath) {
            DB::table('products')
                ->where('title', $title)
                ->update(['image_path' => $imagePath]);
        }
    }

    public function down(): void
    {
        // Remove images
        DB::table('services')->update(['image_path' => null]);
        DB::table('products')->update(['image_path' => null]);
    }
};
