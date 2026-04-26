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
        Schema::table('inquiries', function (Blueprint $table) {
            // Add payment tracking fields if they don't exist
            if (!Schema::hasColumn('inquiries', 'payment_id')) {
                $table->unsignedBigInteger('payment_id')->nullable()->after('inquiry_code');
            }
            if (!Schema::hasColumn('inquiries', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->after('payment_id');
            }
            if (!Schema::hasColumn('inquiries', 'payment_status')) {
                $table->string('payment_status')->default('unpaid')->after('transaction_id');
            }
            if (!Schema::hasColumn('inquiries', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('payment_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            if (Schema::hasColumn('inquiries', 'payment_id')) {
                $table->dropColumn('payment_id');
            }
            if (Schema::hasColumn('inquiries', 'transaction_id')) {
                $table->dropColumn('transaction_id');
            }
            if (Schema::hasColumn('inquiries', 'payment_status')) {
                $table->dropColumn('payment_status');
            }
            if (Schema::hasColumn('inquiries', 'paid_at')) {
                $table->dropColumn('paid_at');
            }
        });
    }
};
