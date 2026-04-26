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
        Schema::table('reservations', function (Blueprint $table) {
            // Change the status enum to include 'paid'
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'paid'])->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Revert to original enum without 'paid'
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending')->change();
        });
    }
};
