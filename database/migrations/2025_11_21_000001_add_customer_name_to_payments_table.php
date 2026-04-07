<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Make client_id nullable to support guest payments
            $table->foreignId('client_id')->nullable()->change();
            
            // Add customer_name field to store name directly
            $table->string('customer_name')->nullable()->after('client_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('customer_name');
            $table->foreignId('client_id')->nullable(false)->change();
        });
    }
};
