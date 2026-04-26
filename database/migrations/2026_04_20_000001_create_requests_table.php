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
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->unsignedBigInteger('service_id')->nullable();
            $table->unsignedBigInteger('payment_plan_id');
            $table->unsignedBigInteger('lot_id');
            $table->enum('lot_type', ['LawnLot', 'Columbarium', 'FamilyEstate']);
            $table->string('deceased_name');
            $table->date('deceased_date_of_death');
            $table->string('deceased_relationship')->nullable();
            $table->json('additional_deceased_info')->nullable();
            $table->enum('status', ['Pending_Approval', 'Approved', 'Rejected', 'Cancelled'])->default('Pending_Approval');
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->json('status_history')->default('[]');
            $table->timestamps();

            // Indexes
            $table->index('user_id', 'idx_user_id');
            $table->index('status', 'idx_status');
            $table->index('created_at', 'idx_created_at');
            $table->index('admin_id', 'idx_admin_id');
            $table->index(['user_id', 'status'], 'idx_user_status');
            $table->index(['status', 'created_at'], 'idx_status_created');
        });

        // Add foreign keys after table creation
        Schema::table('requests', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
            $table->foreign('payment_plan_id')->references('id')->on('payment_plans')->onDelete('restrict');
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
