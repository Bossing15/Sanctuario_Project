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
        Schema::table('requests', function (Blueprint $table) {
            // Progress tracking fields
            $table->enum('progress_status', [
                'Not Started',
                'In Progress',
                'Completed',
                'On Hold'
            ])->default('Not Started')->after('status');
            
            $table->integer('progress_percentage')->default(0)->after('progress_status');
            $table->text('current_progress_note')->nullable()->after('progress_percentage');
            $table->json('progress_updates')->nullable()->after('current_progress_note');
            $table->timestamp('progress_started_at')->nullable()->after('progress_updates');
            $table->timestamp('progress_completed_at')->nullable()->after('progress_started_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn([
                'progress_status',
                'progress_percentage',
                'current_progress_note',
                'progress_updates',
                'progress_started_at',
                'progress_completed_at'
            ]);
        });
    }
};
