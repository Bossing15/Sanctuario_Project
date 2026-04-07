<?php

namespace App\Http\Controllers;

use App\Models\AdminPermission;
use Illuminate\Http\Request;

class AdminPermissionController extends Controller
{
    public function getAdminPermissions($adminId)
    {
        try {
            $permissions = AdminPermission::where('admin_id', $adminId)->get();
            return response()->json(['permissions' => $permissions]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateAdminPermissions(Request $request, $adminId)
    {
        try {
            $validated = $request->validate([
                'permissions' => 'required|array',
            ]);

            AdminPermission::where('admin_id', $adminId)->delete();
            
            foreach ($validated['permissions'] as $key => $value) {
                AdminPermission::create([
                    'admin_id' => $adminId,
                    'permission_key' => $key,
                    'can_perform_actions' => $value,
                ]);
            }

            return response()->json(['message' => 'Permissions updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getMyPermissions(Request $request)
    {
        try {
            $user = $request->user();
            $permissions = $user->permissions ?? [];
            return response()->json(['permissions' => $permissions]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
