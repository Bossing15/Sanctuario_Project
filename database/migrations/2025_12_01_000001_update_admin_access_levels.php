<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, update existing values to new role names
        DB::table('admins')->where('access_level', 'super_admin')->update(['access_level' => 'admin']);
        DB::table('admins')->where('access_level', 'moderator')->update(['access_level' => 'caretaker']);
        // 'admin' stays as 'staff' - but we need to do this carefully
        // Actually, let's map: super_admin -> admin, admin -> staff, moderator -> caretaker
        
        // Since we can't directly change enum, we'll use a workaround
        // Change column to string first, update values, then back to enum
        Schema::table('admins', function (Blueprint $table) {
            $table->string('access_level_new')->default('staff')->after('access_level');
        });

        // Map old values to new
        DB::table('admins')->where('access_level', 'super_admin')->update(['access_level_new' => 'admin']);
        DB::table('admins')->where('access_level', 'admin')->update(['access_level_new' => 'staff']);
        DB::table('admins')->where('access_level', 'moderator')->update(['access_level_new' => 'caretaker']);

        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('access_level');
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->renameColumn('access_level_new', 'access_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->string('access_level_old')->default('admin')->after('access_level');
        });

        DB::table('admins')->where('access_level', 'admin')->update(['access_level_old' => 'super_admin']);
        DB::table('admins')->where('access_level', 'staff')->update(['access_level_old' => 'admin']);
        DB::table('admins')->where('access_level', 'caretaker')->update(['access_level_old' => 'moderator']);

        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('access_level');
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->renameColumn('access_level_old', 'access_level');
        });
    }
};
