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
        Schema::table('clients', function (Blueprint $table) {
            // Add columns if they don't exist
            if (!Schema::hasColumn('clients', 'archived')) {
                $table->boolean('archived')->default(false);
            }
            if (!Schema::hasColumn('clients', 'archived_at')) {
                $table->timestamp('archived_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            if (Schema::hasColumn('clients', 'archived')) {
                $table->dropColumn('archived');
            }
            if (Schema::hasColumn('clients', 'archived_at')) {
                $table->dropColumn('archived_at');
            }
        });
    }
};
