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
        Schema::table('services', function (Blueprint $table) {
            $table->string('package_title')->nullable()->after('pricing_subtitle');
            $table->text('package_description')->nullable()->after('package_title');
            $table->string('package_note')->nullable()->after('package_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['package_title', 'package_description', 'package_note']);
        });
    }
};
