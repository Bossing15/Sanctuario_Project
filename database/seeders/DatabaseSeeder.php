<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed clients for testing
        $this->call([
            ClientSeeder::class,
            ProductSeeder::class,
            ServiceSeeder::class,
            LawnLotsSeeder::class,
            ColumbariumSeeder::class,
            FamilyEstateSeeder::class,
            SiteSettingsSeeder::class,
        ]);
    }
}
