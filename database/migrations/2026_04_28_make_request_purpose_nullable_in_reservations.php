<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Make request_purpose nullable for services
            if (Schema::hasColumn('reservations', 'request_purpose')) {
                $table->enum('request_purpose', ['deceased', 'reservation'])->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Revert request_purpose to not nullable with default
            if (Schema::hasColumn('reservations', 'request_purpose')) {
                $table->enum('request_purpose', ['deceased', 'reservation'])->default('deceased')->change();
            }
        });
    }
};
