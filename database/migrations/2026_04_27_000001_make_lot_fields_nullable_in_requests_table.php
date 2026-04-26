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
        Schema::table('requests', function (Blueprint $table) {
            // Make lot-related fields nullable for service requests
            $table->unsignedBigInteger('lot_id')->nullable()->change();
            $table->string('lot_type')->nullable()->change();
            $table->unsignedBigInteger('payment_plan_id')->nullable()->change();
            $table->string('deceased_name')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->unsignedBigInteger('lot_id')->nullable(false)->change();
            $table->string('lot_type')->nullable(false)->change();
            $table->unsignedBigInteger('payment_plan_id')->nullable(false)->change();
            $table->string('deceased_name')->nullable(false)->change();
        });
    }
};
