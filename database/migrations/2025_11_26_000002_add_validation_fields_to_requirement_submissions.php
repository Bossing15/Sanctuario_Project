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
        Schema::table('requirement_submissions', function (Blueprint $table) {
            $table->string('validation_status')->default('pending')->after('status'); // pending, auto_approved, flagged, manual_review
            $table->integer('similarity_score')->nullable()->after('validation_status'); // 0-100 score
            $table->json('validation_checks')->nullable()->after('similarity_score'); // Store validation results
            $table->text('validation_notes')->nullable()->after('validation_checks'); // Auto-generated notes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requirement_submissions', function (Blueprint $table) {
            $table->dropColumn(['validation_status', 'similarity_score', 'validation_checks', 'validation_notes']);
        });
    }
};
