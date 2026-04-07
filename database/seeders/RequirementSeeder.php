<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Requirement::create([
            'name' => 'Death Certificate',
            'description' => 'A clear photo or scanned copy of the official death certificate',
            'file_type' => 'image',
            'max_file_size' => 5242880, // 5MB
            'is_mandatory' => true,
        ]);
    }
}
