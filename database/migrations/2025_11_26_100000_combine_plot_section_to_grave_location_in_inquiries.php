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
        // Add grave_location column
        Schema::table('inquiries', function (Blueprint $table) {
            $table->string('grave_location')->nullable()->after('section_number');
        });

        // Migrate existing data: combine plot_number and section_number into grave_location
        DB::table('inquiries')->whereNotNull('plot_number')->orWhereNotNull('section_number')->get()->each(function ($inquiry) {
            $graveLocation = '';
            
            if ($inquiry->section_number && $inquiry->plot_number) {
                $graveLocation = "Section {$inquiry->section_number}, Plot {$inquiry->plot_number}";
            } elseif ($inquiry->section_number) {
                $graveLocation = "Section {$inquiry->section_number}";
            } elseif ($inquiry->plot_number) {
                $graveLocation = "Plot {$inquiry->plot_number}";
            }
            
            if ($graveLocation) {
                DB::table('inquiries')
                    ->where('id', $inquiry->id)
                    ->update(['grave_location' => $graveLocation]);
            }
        });

        // Drop old columns
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn(['plot_number', 'section_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back the old columns
        Schema::table('inquiries', function (Blueprint $table) {
            $table->string('plot_number')->nullable()->after('phone');
            $table->string('section_number')->nullable()->after('plot_number');
        });

        // Migrate data back (attempt to parse grave_location)
        DB::table('inquiries')->whereNotNull('grave_location')->get()->each(function ($inquiry) {
            $location = $inquiry->grave_location;
            $plotNumber = null;
            $sectionNumber = null;
            
            // Try to extract section and plot from combined string
            if (preg_match('/Section\s+([^,]+)/i', $location, $sectionMatches)) {
                $sectionNumber = trim($sectionMatches[1]);
            }
            if (preg_match('/Plot\s+(.+)/i', $location, $plotMatches)) {
                $plotNumber = trim($plotMatches[1]);
            }
            
            DB::table('inquiries')
                ->where('id', $inquiry->id)
                ->update([
                    'plot_number' => $plotNumber,
                    'section_number' => $sectionNumber
                ]);
        });

        // Drop grave_location column
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn('grave_location');
        });
    }
};
