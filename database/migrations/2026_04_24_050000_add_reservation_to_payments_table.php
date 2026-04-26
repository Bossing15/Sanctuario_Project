<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Add reservation_id if it doesn't exist
            if (!Schema::hasColumn('payments', 'reservation_id')) {
                $table->foreignId('reservation_id')->nullable()->constrained('reservations')->onDelete('set null')->after('id');
            }
            
            // Add user_id if it doesn't exist (for flexibility)
            if (!Schema::hasColumn('payments', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('clients')->onDelete('cascade')->after('reservation_id');
            }
            
            // Add product_id if it doesn't exist
            if (!Schema::hasColumn('payments', 'product_id')) {
                $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null')->after('user_id');
            }
            
            // Add transaction_id if it doesn't exist
            if (!Schema::hasColumn('payments', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->unique()->after('product_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'reservation_id')) {
                try {
                    $table->dropForeign(['reservation_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }
                $table->dropColumn('reservation_id');
            }
            
            if (Schema::hasColumn('payments', 'user_id')) {
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }
                $table->dropColumn('user_id');
            }
            
            if (Schema::hasColumn('payments', 'product_id')) {
                try {
                    $table->dropForeign(['product_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }
                $table->dropColumn('product_id');
            }
            
            if (Schema::hasColumn('payments', 'transaction_id')) {
                $table->dropColumn('transaction_id');
            }
        });
    }
};
