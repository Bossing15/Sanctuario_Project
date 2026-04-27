<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Make deceased_name nullable for services
            if (Schema::hasColumn('reservations', 'deceased_name')) {
                $table->string('deceased_name')->nullable()->change();
            }
            
            // Make deceased_date_of_death nullable for services
            if (Schema::hasColumn('reservations', 'deceased_date_of_death')) {
                $table->date('deceased_date_of_death')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Revert deceased_name to not nullable
            if (Schema::hasColumn('reservations', 'deceased_name')) {
                $table->string('deceased_name')->nullable(false)->change();
            }
            
            // Revert deceased_date_of_death to not nullable
            if (Schema::hasColumn('reservations', 'deceased_date_of_death')) {
                $table->date('deceased_date_of_death')->nullable(false)->change();
            }
        });
    }
};
