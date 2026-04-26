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
            // Drop inquiry_code if it exists
            if (Schema::hasColumn('payments', 'inquiry_code')) {
                $table->dropColumn('inquiry_code');
            }
            
            // Add invoice_number if it doesn't exist
            if (!Schema::hasColumn('payments', 'invoice_number')) {
                $table->string('invoice_number')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'invoice_number')) {
                $table->dropColumn('invoice_number');
            }
            
            if (!Schema::hasColumn('payments', 'inquiry_code')) {
                $table->string('inquiry_code')->nullable();
            }
        });
    }
};
