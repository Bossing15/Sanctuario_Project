<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\User;

class PermissionService
{
    /**
     * Check if a user can perform actions on a specific component
     * 
     * Simplified RBAC:
     * - Admin: Can perform all actions on all components
     * - Staff/Caretaker: Can perform actions only if component is enabled (true)
     *   If component is disabled (false), they can only view
     * 
     * @param Admin|User $user
     * @param string $component
     * @return bool
     */
    public function canPerformActions($user, string $component): bool
    {
        // Admin role can perform all actions
        if ($user->access_level === 'admin' || $user->role === 'admin') {
            return true;
        }

        // Get permissions from user
        $permissions = $user->permissions ?? [];

        // If component is enabled (true), staff/caretaker can perform actions
        // If component is disabled (false), staff/caretaker can only view
        return isset($permissions[$component]) && $permissions[$component] === true;
    }

    /**
     * Check if a user can view a specific component
     * 
     * Simplified RBAC:
     * - Admin: Can view all components
     * - Staff/Caretaker: Can view all components (even if disabled)
     * 
     * @param Admin|User $user
     * @param string $component
     * @return bool
     */
    public function canView($user, string $component): bool
    {
        // Admin can view everything
        if ($user->access_level === 'admin' || $user->role === 'admin') {
            return true;
        }

        // Staff/Caretaker can view all components
        return true;
    }

    /**
     * Get all permissions for a user
     * 
     * @param Admin|User $user
     * @return array
     */
    public function getPermissions($user): array
    {
        if ($user->access_level === 'admin' || $user->role === 'admin') {
            // Admin has all permissions enabled
            return [
                'dashboard' => true,
                'customers' => true,
                'billing' => true,
                'graves' => true,
                'requirements' => true,
                'inquiries' => true,
                'messages' => true,
                'admin' => true,
            ];
        }

        return $user->permissions ?? [];
    }

    /**
     * Check if user is admin
     * 
     * @param Admin|User $user
     * @return bool
     */
    public function isAdmin($user): bool
    {
        return $user->access_level === 'admin' || $user->role === 'admin';
    }

    /**
     * Check if user is staff
     * 
     * @param Admin|User $user
     * @return bool
     */
    public function isStaff($user): bool
    {
        return $user->access_level === 'staff' || $user->role === 'staff';
    }

    /**
     * Check if user is caretaker
     * 
     * @param Admin|User $user
     * @return bool
     */
    public function isCaretaker($user): bool
    {
        return $user->access_level === 'caretaker' || $user->role === 'caretaker';
    }
}
