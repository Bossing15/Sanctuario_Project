<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ServiceProductImagesSeeder extends Seeder
{
    public function run(): void
    {
        // Create directories if they don't exist
        Storage::disk('public')->makeDirectory('services', 0755, true);
        Storage::disk('public')->makeDirectory('products', 0755, true);

        // Copy service images
        $serviceImages = [
            'maintenance.jpg' => 'client-app/src/assets/images/Sanctuario3_1.jpg',
            'interment.jpg' => 'client-app/src/assets/images/interment.jpg',
            'cremation.jpg' => 'client-app/src/assets/images/cremation.jpg',
        ];

        foreach ($serviceImages as $destName => $sourcePath) {
            $fullSourcePath = base_path($sourcePath);
            if (File::exists($fullSourcePath)) {
                $content = File::get($fullSourcePath);
                Storage::disk('public')->put("services/{$destName}", $content);
                echo "Copied service image: {$destName}\n";
            } else {
                echo "Source file not found: {$sourcePath}\n";
            }
        }

        // Copy product images
        $productImages = [
            'lawn_lots.jpg' => 'client-app/src/assets/images/lawn_lots.jpg',
            'family_estates.jpg' => 'client-app/src/assets/images/familt_estate.jpg',
            'columbariums.jpg' => 'client-app/src/assets/images/columbarium.jpg',
        ];

        foreach ($productImages as $destName => $sourcePath) {
            $fullSourcePath = base_path($sourcePath);
            if (File::exists($fullSourcePath)) {
                $content = File::get($fullSourcePath);
                Storage::disk('public')->put("products/{$destName}", $content);
                echo "Copied product image: {$destName}\n";
            } else {
                echo "Source file not found: {$sourcePath}\n";
            }
        }
    }
}
