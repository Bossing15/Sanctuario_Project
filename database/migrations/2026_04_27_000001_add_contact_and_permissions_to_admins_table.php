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
        Schema::table('admins', function (Blueprint $table) {
            // Add contact column if it doesn't exist
            if (!Schema::hasColumn('admins', 'contact')) {
                $table->string('contact')->nullable()->after('email');
            }
            
            // Add permissions column if it doesn't exist
            if (!Schema::hasColumn('admins', 'permissions')) {
                $table->json('permissions')->nullable()->after('is_active');
            }
            
            // Add role column if it doesn't exist
            if (!Schema::hasColumn('admins', 'role')) {
                $table->string('role')->nullable()->after('access_level');
            }
            
            // Add status column if it doesn't exist
            if (!Schema::hasColumn('admins', 'status')) {
                $table->string('status')->default('Active')->after('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            if (Schema::hasColumn('admins', 'contact')) {
                $table->dropColumn('contact');
            }
            if (Schema::hasColumn('admins', 'permissions')) {
                $table->dropColumn('permissions');
            }
            if (Schema::hasColumn('admins', 'role')) {
                $table->dropColumn('role');
            }
            if (Schema::hasColumn('admins', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
