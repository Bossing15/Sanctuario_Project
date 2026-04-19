<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'paymongo_intent_id')) {
                $table->string('paymongo_intent_id')->nullable();
            }
            if (!Schema::hasColumn('payments', 'paymongo_client_key')) {
                $table->string('paymongo_client_key')->nullable();
            }
            if (!Schema::hasColumn('payments', 'customer_name')) {
                $table->string('customer_name')->nullable();
            }
            if (!Schema::hasColumn('payments', 'service_type')) {
                $table->string('service_type')->nullable();
            }
            if (!Schema::hasColumn('payments', 'completed_at')) {
                $table->timestamp('completed_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'paymongo_intent_id',
                'paymongo_client_key',
                'customer_name',
                'service_type',
                'completed_at'
            ]);
        });
    }
};
