<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RequirementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $requirements = [
            [
                'name' => 'Valid Government ID',
                'description' => 'A clear photo or scan of a valid government-issued identification document (Driver\'s License, Passport, or National ID)',
                'file_type' => 'image',
                'max_file_size' => 5242880, // 5MB
                'is_mandatory' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Proof of Ownership (Deed of Sale)',
                'description' => 'Document proving ownership of the grave site - Deed of Sale or Certificate of Ownership',
                'file_type' => 'image',
                'max_file_size' => 5242880,
                'is_mandatory' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Death Certificate',
                'description' => 'Official death certificate of the deceased',
                'file_type' => 'image',
                'max_file_size' => 5242880,
                'is_mandatory' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Burial Permit',
                'description' => 'Official burial permit or authorization letter',
                'file_type' => 'image',
                'max_file_size' => 5242880,
                'is_mandatory' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($requirements as $requirement) {
            DB::table('requirements')->updateOrInsert(
                ['name' => $requirement['name']],
                $requirement
            );
        }

        $this->command->info('Requirements seeded successfully!');
    }
}
