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
            if (!Schema::hasColumn('bookings', 'product_id')) {
                $table->unsignedBigInteger('product_id')->nullable()->after('service_id');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('bookings', 'plan_type')) {
                $table->string('plan_type')->nullable()->after('product_id');
            }
            
            if (!Schema::hasColumn('bookings', 'amount')) {
                $table->decimal('amount', 10, 2)->nullable()->after('plan_type');
            }
            
            if (!Schema::hasColumn('bookings', 'booking_date')) {
                $table->date('booking_date')->nullable()->after('amount');
            }
            
            if (!Schema::hasColumn('bookings', 'notes')) {
                $table->text('notes')->nullable()->after('booking_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'product_id')) {
                $table->dropForeign(['product_id']);
                $table->dropColumn('product_id');
            }
            if (Schema::hasColumn('bookings', 'plan_type')) {
                $table->dropColumn('plan_type');
            }
            if (Schema::hasColumn('bookings', 'amount')) {
                $table->dropColumn('amount');
            }
            if (Schema::hasColumn('bookings', 'booking_date')) {
                $table->dropColumn('booking_date');
            }
            if (Schema::hasColumn('bookings', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};
