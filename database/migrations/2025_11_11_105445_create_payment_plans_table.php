<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->string('plan_name');
            $table->decimal('total_amount', 10, 2);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->integer('total_installments');
            $table->integer('installments_paid')->default(0);
            $table->decimal('installment_amount', 10, 2);
            $table->enum('frequency', ['monthly', 'quarterly', 'yearly']);
            $table->date('start_date');
            $table->date('next_due_date');
            $table->enum('status', ['active', 'completed', 'cancelled', 'overdue'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['client_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_plans');
    }
};
