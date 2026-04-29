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
        // Create cache table if it doesn't exist
        if (!Schema::hasTable('cache')) {
            DB::statement("
                CREATE TABLE cache (
                    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
                    value MEDIUMTEXT NOT NULL,
                    expiration INT NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
        }

        // Create cache_locks table if it doesn't exist
        if (!Schema::hasTable('cache_locks')) {
            DB::statement("
                CREATE TABLE cache_locks (
                    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
                    owner VARCHAR(255) NOT NULL,
                    expiration INT NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
