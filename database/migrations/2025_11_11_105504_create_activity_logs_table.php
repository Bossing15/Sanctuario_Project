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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name')->nullable();
            $table->string('user_email')->nullable();
            $table->string('action'); // e.g., 'payment_processed', 'reservation_approved', 'requirement_reviewed'
            $table->string('entity_type')->nullable(); // e.g., 'Payment', 'Reservation', 'Booking'
            $table->unsignedBigInteger('entity_id')->nullable(); // ID of the affected entity
            $table->text('description')->nullable(); // Detailed description of the action
            $table->json('changes')->nullable(); // JSON data of what changed
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('admins')->onDelete('set null');
            $table->index('action');
            $table->index('entity_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
