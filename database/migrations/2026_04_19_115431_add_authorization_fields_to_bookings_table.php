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
            // Authorization workflow fields
            $table->enum('authorization_status', ['AUTO_APPROVED', 'PENDING_AUTHORIZATION', 'AUTHORIZED', 'REJECTED'])->default('AUTO_APPROVED')->after('status');
            $table->unsignedBigInteger('approved_by')->nullable()->after('authorization_status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');
            $table->timestamp('rejected_at')->nullable()->after('rejection_reason');
            
            // Foreign key for approved_by
            $table->foreign('approved_by')->references('id')->on('admins')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['authorization_status', 'approved_by', 'approved_at', 'rejection_reason', 'rejected_at']);
        });
    }
};
