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
            if (!Schema::hasColumn('payments', 'booking_id')) {
                $table->unsignedBigInteger('booking_id')->nullable()->after('client_id');
                $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('payments', 'product_id')) {
                $table->unsignedBigInteger('product_id')->nullable()->after('service_id');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['booking_id']);
            $table->dropForeign(['product_id']);
            $table->dropColumn(['booking_id', 'product_id', 'plan_type']);
        });
    }
};
