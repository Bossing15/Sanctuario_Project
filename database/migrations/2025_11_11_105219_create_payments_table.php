<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('grave_id')->nullable()->constrained('graves')->onDelete('set null');
            $table->foreignId('service_id')->nullable()->constrained('services')->onDelete('set null');
            $table->string('payment_reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['GCash', 'Card', 'Bank Transfer', 'Cash', 'PayMongo', 'GrabPay', 'PayMaya']);
            $table->enum('payment_type', ['full', 'installment', 'partial']);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded', 'overdue'])->default('pending');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Store PayMongo data
            $table->decimal('penalty_amount', 10, 2)->default(0);
            $table->boolean('reminder_sent')->default(false);
            $table->timestamp('reminder_sent_at')->nullable();
            $table->string('receipt_path')->nullable();
            $table->string('paymongo_intent_id')->nullable();
            $table->string('paymongo_client_key')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('service_type')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['client_id', 'status']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
