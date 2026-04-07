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
        Schema::create('graves', function (Blueprint $table) {
            $table->id();
            $table->string('deceased_name');
            $table->string('section');
            $table->string('plot_number');
            $table->string('grave_location'); // Combined section and plot for display
            $table->unsignedBigInteger('client_id'); // Foreign key to clients table
            $table->string('relationship_to_deceased');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->date('burial_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            
            // Indexes for better performance
            $table->index(['section', 'plot_number']);
            $table->index('status');
            $table->index('client_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('graves');
    }
};
