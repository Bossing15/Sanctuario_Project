<?php

namespace App\Policies;

use App\Models\Request;
use App\Models\Client;
use App\Models\Admin;

class RequestPolicy
{
    /**
     * Determine if the user can view the request.
     * Client can view if they own the request or are an admin.
     */
    public function view($user, Request $request): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        return $user->id === $request->user_id;
    }

    /**
     * Determine if the user can cancel the request.
     * Only the request owner can cancel, and only if status is Pending_Approval.
     */
    public function cancel($user, Request $request): bool
    {
        if ($user instanceof Admin) {
            return false;
        }

        return $user->id === $request->user_id && $request->status === 'Pending_Approval';
    }

    /**
     * Determine if the user can approve the request.
     * Only admins can approve, and only if status is Pending_Approval.
     */
    public function approve($user, Request $request): bool
    {
        if (!$user instanceof Admin) {
            return false;
        }

        return $request->status === 'Pending_Approval';
    }

    /**
     * Determine if the user can reject the request.
     * Only admins can reject, and only if status is Pending_Approval.
     */
    public function reject($user, Request $request): bool
    {
        if (!$user instanceof Admin) {
            return false;
        }

        return $request->status === 'Pending_Approval';
    }
}
