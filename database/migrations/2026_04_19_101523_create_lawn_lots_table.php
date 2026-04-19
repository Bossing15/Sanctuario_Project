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
        Schema::create('lawn_lots', function (Blueprint $table) {
            $table->id();
            $table->string('plot_number')->unique();
            $table->string('grave_location');
            $table->string('section'); // Standard, Deluxe, Premium, Super Premium
            $table->string('status')->default('Inactive'); // Inactive = available, Active = occupied
            $table->unsignedBigInteger('client_id')->nullable();
            $table->string('deceased_name')->default('Available');
            $table->string('relationship_to_deceased')->nullable();
            $table->date('burial_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lawn_lots');
    }
};
