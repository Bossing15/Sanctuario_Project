<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Get all activity logs with filtering and pagination
     * GET /api/admin/activity-logs
     */
    public function index(Request $request)
    {
        try {
            $query = ActivityLog::query();

            // Filter by action
            if ($request->has('action') && $request->action) {
                $query->where('action', $request->action);
            }

            // Filter by entity type
            if ($request->has('entity_type') && $request->entity_type) {
                $query->where('entity_type', $request->entity_type);
            }

            // Filter by user
            if ($request->has('user_id') && $request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by date range
            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }

            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            // Search in description
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhere('user_name', 'like', "%{$search}%")
                      ->orWhere('action', 'like', "%{$search}%");
                });
            }

            // Sort by latest first
            $logs = $query->orderBy('created_at', 'desc')
                         ->paginate($request->get('per_page', 50));

            return response()->json([
                'message' => 'Activity logs retrieved successfully',
                'data' => $logs->items(),
                'pagination' => [
                    'total' => $logs->total(),
                    'per_page' => $logs->perPage(),
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'from' => $logs->firstItem(),
                    'to' => $logs->lastItem(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve activity logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get activity log statistics
     * GET /api/admin/activity-logs/stats
     */
    public function getStats(Request $request)
    {
        try {
            $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
            $endDate = $request->get('end_date', now()->toDateString());

            $stats = [
                'total_activities' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])->count(),
                'by_action' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])
                    ->groupBy('action')
                    ->selectRaw('action, count(*) as count')
                    ->get()
                    ->pluck('count', 'action'),
                'by_entity_type' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])
                    ->groupBy('entity_type')
                    ->selectRaw('entity_type, count(*) as count')
                    ->get()
                    ->pluck('count', 'entity_type'),
                'by_user' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])
                    ->groupBy('user_id', 'user_name')
                    ->selectRaw('user_id, user_name, count(*) as count')
                    ->get(),
                'recent_activities' => ActivityLog::whereBetween('created_at', [$startDate, $endDate])
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get(),
            ];

            return response()->json([
                'message' => 'Activity statistics retrieved successfully',
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve activity statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get activity log details
     * GET /api/admin/activity-logs/{id}
     */
    public function show($id)
    {
        try {
            $log = ActivityLog::findOrFail($id);

            return response()->json([
                'message' => 'Activity log retrieved successfully',
                'data' => $log
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Activity log not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get available actions for filtering
     * GET /api/admin/activity-logs/actions
     */
    public function getActions()
    {
        try {
            $actions = ActivityLog::distinct('action')
                ->pluck('action')
                ->sort()
                ->values();

            return response()->json([
                'message' => 'Actions retrieved successfully',
                'data' => $actions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve actions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export activity logs to CSV
     * GET /api/admin/activity-logs/export/csv
     */
    public function exportCsv(Request $request)
    {
        try {
            $query = ActivityLog::query();

            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }

            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            $logs = $query->orderBy('created_at', 'desc')->get();

            $csv = "ID,User Name,User Email,Action,Entity Type,Entity ID,Description,IP Address,Created At\n";
            
            foreach ($logs as $log) {
                $csv .= sprintf(
                    '"%s","%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
                    $log->id,
                    $log->user_name,
                    $log->user_email,
                    $log->action,
                    $log->entity_type,
                    $log->entity_id,
                    str_replace('"', '""', $log->description),
                    $log->ip_address,
                    $log->created_at
                );
            }

            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="activity-logs-' . now()->format('Y-m-d-H-i-s') . '.csv"');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to export activity logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
