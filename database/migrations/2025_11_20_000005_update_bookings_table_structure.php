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
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('service_id');
            $table->enum('status', [
                'PendingRequirements',
                'PendingReview', 
                'ReadyForPayment',
                'Paid',
                'InProgress',
                'Completed',
                'Cancelled'
            ])->default('ReadyForPayment');
            $table->decimal('total_amount', 10, 2);
            $table->unsignedBigInteger('payment_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'service_id', 'status', 'total_amount', 'payment_id']);
        });
    }
};