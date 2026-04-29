<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get admin notifications
     * Returns notifications for the authenticated admin user
     */
    public function getAdminNotifications(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Fetch admin notifications from the database
            $notifications = AdminNotification::where('admin_id', $user->id)
                ->orWhere('admin_id', null) // System-wide notifications
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->type ?? 'system',
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'read' => (bool) $notification->is_read,
                        'time' => $notification->created_at->diffForHumans(),
                        'icon' => $this->getIconForType($notification->type ?? 'system'),
                        'color' => $this->getColorForType($notification->type ?? 'system'),
                        'created_at' => $notification->created_at,
                    ];
                });
            
            return response()->json([
                'data' => $notifications,
                'count' => $notifications->count(),
                'unread_count' => $notifications->where('read', false)->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching admin notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'data' => [],
                'count' => 0,
                'unread_count' => 0
            ]);
        }
    }

    /**
     * Get client notifications
     * Returns notifications for the authenticated client user
     */
    public function getClientNotifications(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $notifications = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'read' => (bool) $notification->is_read,
                        'time' => $notification->created_at->diffForHumans(),
                        'icon' => $this->getIconForType($notification->type),
                        'color' => $this->getColorForType($notification->type),
                        'created_at' => $notification->created_at,
                    ];
                });
            
            return response()->json([
                'data' => $notifications,
                'count' => $notifications->count(),
                'unread_count' => $notifications->where('read', false)->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching client notifications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'data' => [],
                'count' => 0,
                'unread_count' => 0
            ]);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $notification = Notification::where('user_id', $user->id)
                ->findOrFail($id);
            
            $notification->markAsRead();
            
            return response()->json([
                'message' => 'Notification marked as read',
                'notification' => $notification
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error marking notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
            
            return response()->json([
                'message' => 'All notifications marked as read'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error marking all notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread count
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $count = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            return response()->json([
                'count' => $count
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'count' => 0
            ]);
        }
    }

    /**
     * Get icon for notification type
     */
    private function getIconForType(string $type): string
    {
        return match($type) {
            'payment' => 'payment',
            'client' => 'client',
            'service' => 'service',
            'pending' => 'pending',
            'system' => 'system',
            default => 'system'
        };
    }

    /**
     * Get color for notification type
     */
    private function getColorForType(string $type): string
    {
        return match($type) {
            'payment' => 'blue',
            'client' => 'forest-green',
            'service' => 'forest-green',
            'pending' => 'blue',
            'system' => 'forest-green',
            default => 'forest-green'
        };
    }
}
