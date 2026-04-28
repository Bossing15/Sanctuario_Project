<?php

namespace App\Http\Controllers;

use App\Models\Request as MaintenanceRequest;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class MaintenanceRequestController extends Controller
{
    /**
     * Get all maintenance requests
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = MaintenanceRequest::with(['user', 'client', 'service', 'product', 'admin'])
                ->orderBy('created_at', 'desc');

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by progress_status if provided
            if ($request->has('progress_status')) {
                $query->where('progress_status', $request->progress_status);
            }

            // Filter by user if provided
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            $requests = $query->get();

            return response()->json([
                'success' => true,
                'requests' => $requests,
                'message' => 'Maintenance requests retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve maintenance requests', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve maintenance requests: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific maintenance request
     */
    public function show($id): JsonResponse
    {
        try {
            $request = MaintenanceRequest::with(['user', 'client', 'service', 'product', 'admin'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'request' => $request,
                'progress_history' => $request->getProgressHistory(),
                'can_update_progress' => $request->canUpdateProgress()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve maintenance request', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Maintenance request not found'
            ], 404);
        }
    }

    /**
     * Create a new maintenance request
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:clients,id',
                'service_id' => 'nullable|exists:services,id',
                'product_id' => 'nullable|exists:products,id',
                'payment_plan_id' => 'required|exists:payment_plans,id',
                'lot_id' => 'nullable|integer',
                'lot_type' => 'nullable|in:LawnLot,Columbarium,FamilyEstate',
                'deceased_name' => 'required|string',
                'deceased_date_of_death' => 'required|date',
                'deceased_relationship' => 'nullable|string',
                'additional_deceased_info' => 'nullable|array',
                'amount' => 'nullable|numeric|min:0',
            ]);

            $maintenanceRequest = MaintenanceRequest::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance request created successfully',
                'request' => $maintenanceRequest
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create maintenance request', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create maintenance request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a maintenance request
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $maintenanceRequest = MaintenanceRequest::findOrFail($id);

            $validated = $request->validate([
                'service_id' => 'nullable|exists:services,id',
                'product_id' => 'nullable|exists:products,id',
                'payment_plan_id' => 'nullable|exists:payment_plans,id',
                'lot_id' => 'nullable|integer',
                'lot_type' => 'nullable|in:LawnLot,Columbarium,FamilyEstate',
                'deceased_name' => 'nullable|string',
                'deceased_date_of_death' => 'nullable|date',
                'deceased_relationship' => 'nullable|string',
                'additional_deceased_info' => 'nullable|array',
                'status' => 'nullable|in:Pending_Approval,Approved,Rejected,Cancelled',
                'amount' => 'nullable|numeric|min:0',
            ]);

            $maintenanceRequest->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance request updated successfully',
                'request' => $maintenanceRequest->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update maintenance request', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update maintenance request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a maintenance request
     */
    public function destroy($id): JsonResponse
    {
        try {
            $maintenanceRequest = MaintenanceRequest::findOrFail($id);
            $maintenanceRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Maintenance request deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete maintenance request', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete maintenance request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update progress of a maintenance request
     * Available immediately after approval, regardless of payment status
     */
    public function updateProgress(Request $request, $id): JsonResponse
    {
        try {
            $maintenanceRequest = MaintenanceRequest::findOrFail($id);

            // Check if request is approved
            if (!$maintenanceRequest->canUpdateProgress()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Progress can only be updated for approved maintenance requests'
                ], 403);
            }

            $validated = $request->validate([
                'progress_status' => 'required|in:Not Started,In Progress,Completed,On Hold',
                'progress_percentage' => 'required|integer|min:0|max:100',
                'progress_note' => 'required|string|max:1000',
            ]);

            // Get the authenticated admin
            $admin = $request->user();
            if (!$admin instanceof Admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only admins can update progress'
                ], 403);
            }

            // Update progress
            $maintenanceRequest->updateProgress(
                $admin,
                $validated['progress_status'],
                $validated['progress_percentage'],
                $validated['progress_note']
            );

            return response()->json([
                'success' => true,
                'message' => 'Progress updated successfully',
                'request' => $maintenanceRequest->fresh(),
                'progress_history' => $maintenanceRequest->getProgressHistory()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update maintenance request progress', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update progress: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get progress history for a maintenance request
     */
    public function getProgressHistory($id): JsonResponse
    {
        try {
            $maintenanceRequest = MaintenanceRequest::findOrFail($id);

            return response()->json([
                'success' => true,
                'request_id' => $maintenanceRequest->id,
                'invoice_number' => $maintenanceRequest->invoice_number,
                'current_status' => $maintenanceRequest->progress_status,
                'current_percentage' => $maintenanceRequest->progress_percentage,
                'current_note' => $maintenanceRequest->current_progress_note,
                'progress_history' => $maintenanceRequest->getProgressHistory(),
                'started_at' => $maintenanceRequest->progress_started_at,
                'completed_at' => $maintenanceRequest->progress_completed_at,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve progress history', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve progress history'
            ], 404);
        }
    }

    /**
     * Approve a maintenance request
     */
    public function approve(Request $request, $id): JsonResponse
    {
        try {
            $maintenanceRequest = MaintenanceRequest::findOrFail($id);

            $admin = $request->user();
            if (!$admin instanceof Admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only admins can approve requests'
                ], 403);
            }

            $maintenanceRequest->approve($admin);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance request approved successfully. You can now update progress.',
                'request' => $maintenanceRequest->fresh(),
                'can_update_progress' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to approve maintenance request', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a maintenance request
     */
    public function reject(Request $request, $id): JsonResponse
    {
        try {
            $maintenanceRequest = MaintenanceRequest::findOrFail($id);

            $admin = $request->user();
            if (!$admin instanceof Admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only admins can reject requests'
                ], 403);
            }

            $validated = $request->validate([
                'rejection_reason' => 'required|string|max:1000',
            ]);

            $maintenanceRequest->reject($admin, $validated['rejection_reason']);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance request rejected',
                'request' => $maintenanceRequest->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to reject maintenance request', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject request: ' . $e->getMessage()
            ], 500);
        }
    }
}
