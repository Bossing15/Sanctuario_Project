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
        // Check if username column already exists
        if (!Schema::hasColumn('admins', 'username')) {
            Schema::table('admins', function (Blueprint $table) {
                $table->string('username')->nullable()->after('name');
            });
        }
        
        // Update existing records to have unique usernames based on their email
        $admins = DB::table('admins')->whereNull('username')->orWhere('username', '')->get();
        foreach ($admins as $admin) {
            $username = explode('@', $admin->email)[0];
            $counter = 1;
            $originalUsername = $username;
            
            // Ensure uniqueness
            while (DB::table('admins')->where('username', $username)->where('id', '!=', $admin->id)->exists()) {
                $username = $originalUsername . $counter;
                $counter++;
            }
            
            DB::table('admins')->where('id', $admin->id)->update(['username' => $username]);
        }
        
        // Now make it unique and not nullable if it's not already
        if (!Schema::hasColumn('admins', 'username') || 
            !collect(Schema::getColumnListing('admins'))->contains('username')) {
            Schema::table('admins', function (Blueprint $table) {
                $table->string('username')->unique()->nullable(false)->change();
            });
        } else {
            // Just add unique constraint if column exists but doesn't have it
            try {
                Schema::table('admins', function (Blueprint $table) {
                    $table->string('username')->unique()->nullable(false)->change();
                });
            } catch (\Exception $e) {
                // Unique constraint might already exist, ignore
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};
