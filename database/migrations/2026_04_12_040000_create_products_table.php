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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('category')->nullable();
            $table->longText('description')->nullable();
            $table->string('image_path')->nullable();
            $table->json('gallery_images')->nullable();
            $table->decimal('price_monthly', 10, 2)->nullable();
            $table->decimal('price_quarterly', 10, 2)->nullable();
            $table->decimal('price_yearly', 10, 2)->nullable();
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->string('pricing_title')->nullable();
            $table->string('pricing_subtitle')->nullable();
            $table->string('package_title')->nullable();
            $table->longText('package_description')->nullable();
            $table->longText('package_note')->nullable();
            $table->string('status')->default('Active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
