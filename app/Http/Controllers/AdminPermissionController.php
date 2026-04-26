<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminPermissionController extends Controller
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Get current user's permissions
     */
    public function getMyPermissions(Request $request)
    {
        try {
            $user = $request->user();
            $permissions = $this->permissionService->getPermissions($user);

            return response()->json([
                'permissions' => $permissions,
                'role' => $user->access_level ?? $user->role,
                'is_admin' => $this->permissionService->isAdmin($user),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user permissions', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null,
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update permissions for a specific admin (admin only)
     * 
     * Simplified RBAC:
     * - Admin can enable/disable components for Staff and Caretaker
     * - Disabled component (false) = view only (no actions allowed)
     * - Enabled component (true) = full access (all actions allowed)
     */
    public function updateAdminPermissions(Request $request, $adminId)
    {
        try {
            $user = $request->user();

            // Only admins can update permissions
            if (!$this->permissionService->isAdmin($user)) {
                Log::warning('Unauthorized attempt to update admin permissions', [
                    'user_id' => $user->id,
                    'admin_id' => $adminId,
                ]);
                return response()->json([
                    'message' => 'Forbidden',
                    'error' => 'Only admins can update permissions'
                ], 403);
            }

            // Cannot update own permissions
            if ($user->id == $adminId) {
                return response()->json([
                    'message' => 'Forbidden',
                    'error' => 'You cannot update your own permissions'
                ], 403);
            }

            $validated = $request->validate([
                'permissions' => 'required|array',
            ]);

            $admin = Admin::findOrFail($adminId);

            // Cannot update Admin role permissions
            if ($admin->access_level === 'admin') {
                return response()->json([
                    'message' => 'Forbidden',
                    'error' => 'Cannot update Admin role permissions'
                ], 403);
            }

            // Update permissions
            $admin->permissions = $validated['permissions'];
            $admin->save();

            Log::info('Admin permissions updated', [
                'updated_by' => $user->id,
                'admin_id' => $adminId,
                'permissions' => $validated['permissions'],
            ]);

            return response()->json([
                'message' => 'Permissions updated successfully',
                'permissions' => $admin->permissions
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Admin not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating admin permissions', [
                'error' => $e->getMessage(),
                'admin_id' => $adminId,
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
