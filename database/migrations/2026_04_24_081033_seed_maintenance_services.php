<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert maintenance services
        DB::table('services')->insertOrIgnore([
            [
                'title' => 'Grave Cleaning',
                'description' => 'Professional cleaning of your loved one\'s grave site including headstone cleaning, debris removal, and ground maintenance.',
                'category' => 'Grave Maintenance',
                'price_monthly' => 500.00,
                'price_quarterly' => 1350.00,
                'price_yearly' => 5000.00,
                'discount_percentage' => 0,
                'status' => 'active',
                'image_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Grave Painting',
                'description' => 'Professional repainting and restoration of grave markers and monuments to maintain their appearance and protect against weathering.',
                'category' => 'Grave Maintenance',
                'price_monthly' => 800.00,
                'price_quarterly' => 2200.00,
                'price_yearly' => 8500.00,
                'discount_percentage' => 0,
                'status' => 'active',
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
                'status' => 'active',
                'image_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Delete the maintenance services
        DB::table('services')->where('category', 'Grave Maintenance')->delete();
    }
};
