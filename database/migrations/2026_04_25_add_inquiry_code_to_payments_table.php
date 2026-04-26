<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Add inquiry_code column if it doesn't exist
            if (!Schema::hasColumn('payments', 'inquiry_code')) {
                $table->string('inquiry_code')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'inquiry_code')) {
                $table->dropColumn('inquiry_code');
            }
        });
    }
};
