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
        Schema::table('activity_logs', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('activity_logs', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('activity_logs', 'user_name')) {
                $table->string('user_name')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('activity_logs', 'user_email')) {
                $table->string('user_email')->nullable()->after('user_name');
            }
            if (!Schema::hasColumn('activity_logs', 'action')) {
                $table->string('action')->after('user_email');
            }
            if (!Schema::hasColumn('activity_logs', 'entity_type')) {
                $table->string('entity_type')->nullable()->after('action');
            }
            if (!Schema::hasColumn('activity_logs', 'entity_id')) {
                $table->unsignedBigInteger('entity_id')->nullable()->after('entity_type');
            }
            if (!Schema::hasColumn('activity_logs', 'description')) {
                $table->text('description')->nullable()->after('entity_id');
            }
            if (!Schema::hasColumn('activity_logs', 'changes')) {
                $table->json('changes')->nullable()->after('description');
            }
            if (!Schema::hasColumn('activity_logs', 'ip_address')) {
                $table->string('ip_address')->nullable()->after('changes');
            }
            if (!Schema::hasColumn('activity_logs', 'user_agent')) {
                $table->string('user_agent')->nullable()->after('ip_address');
            }
        });

        // Add indexes if they don't exist
        Schema::table('activity_logs', function (Blueprint $table) {
            if (!Schema::hasIndex('activity_logs', 'activity_logs_action_index')) {
                $table->index('action');
            }
            if (!Schema::hasIndex('activity_logs', 'activity_logs_entity_type_index')) {
                $table->index('entity_type');
            }
            if (!Schema::hasIndex('activity_logs', 'activity_logs_created_at_index')) {
                $table->index('created_at');
            }
        });

        // Add foreign key if it doesn't exist
        Schema::table('activity_logs', function (Blueprint $table) {
            try {
                $table->foreign('user_id')->references('id')->on('admins')->onDelete('set null');
            } catch (\Exception $e) {
                // Foreign key might already exist
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            // Drop foreign key if it exists
            try {
                $table->dropForeign(['user_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist
            }
        });
    }
};
