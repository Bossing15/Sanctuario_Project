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
        // Check if table exists and add missing columns
        if (Schema::hasTable('sms_logs')) {
            Schema::table('sms_logs', function (Blueprint $table) {
                // Add columns if they don't exist
                if (!Schema::hasColumn('sms_logs', 'sent_at')) {
                    $table->timestamp('sent_at')->nullable();
                }
                if (!Schema::hasColumn('sms_logs', 'reference')) {
                    $table->string('reference')->nullable();
                }
                if (!Schema::hasColumn('sms_logs', 'response')) {
                    $table->json('response')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sms_logs')) {
            Schema::table('sms_logs', function (Blueprint $table) {
                $table->dropColumn(['sent_at', 'reference', 'response']);
            });
        }
    }
};
