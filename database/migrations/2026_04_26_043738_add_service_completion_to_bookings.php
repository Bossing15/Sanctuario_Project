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
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('service_completion_status', ['pending', 'ongoing', 'done'])->default('pending')->after('authorization_status');
            $table->json('completion_images')->nullable()->after('service_completion_status');
            $table->timestamp('completion_date')->nullable()->after('completion_images');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['service_completion_status', 'completion_images', 'completion_date']);
        });
    }
};
