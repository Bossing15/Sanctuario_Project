<?php

namespace App\Http\Controllers;

use App\Models\Request as PurchaseRequest;
use App\Models\Admin;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class RequestController extends Controller
{
    private RequestService $requestService;

    public function __construct(RequestService $requestService)
    {
        $this->requestService = $requestService;
    }

    /**
     * Create a new purchase request
     * POST /api/requests
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => 'nullable|exists:products,id',
                'service_id' => 'nullable|exists:services,id',
                'payment_plan_id' => 'required|exists:payment_plans,id',
                'lot_id' => 'required|integer',
                'lot_type' => 'required|in:LawnLot,Columbarium,FamilyEstate',
                'deceased_name' => 'required|string|max:255',
                'deceased_date_of_death' => 'required|date|before:today',
                'deceased_relationship' => 'nullable|string|max:100',
                'additional_deceased_info' => 'nullable|array',
            ]);

            $purchaseRequest = $this->requestService->createRequest(
                auth()->id(),
                $validated
            );

            Log::info('Purchase request created via API', [
                'request_id' => $purchaseRequest->id,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Request created successfully',
                'request' => $purchaseRequest,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation error creating request', [
                'user_id' => auth()->id(),
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create purchase request', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to create request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's requests with filtering and sorting
     * GET /api/requests
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $requests = $this->requestService->getUserRequests(
                auth()->id(),
                $request->query('status'),
                $request->query('sort', 'created_at'),
                $request->query('order', 'desc')
            );

            return response()->json([
                'requests' => $requests,
                'count' => $requests->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch user requests', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch requests',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get request details
     * GET /api/requests/{id}
     */
    public function show(PurchaseRequest $request): JsonResponse
    {
        try {
            $this->authorize('view', $request);

            $request->load([
                'user',
                'product',
                'service',
                'paymentPlan',
                'admin',
            ]);

            return response()->json([
                'request' => $request,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            Log::warning('Unauthorized access to request', [
                'user_id' => auth()->id(),
                'request_id' => $request->id,
            ]);
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        } catch (\Exception $e) {
            Log::error('Failed to fetch request details', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve request (admin only)
     * POST /api/requests/{id}/approve
     */
    public function approve(PurchaseRequest $request): JsonResponse
    {
        try {
            $this->authorize('approve', $request);

            $admin = auth()->user();
            $this->requestService->approveRequest($request, $admin);

            Log::info('Purchase request approved', [
                'request_id' => $request->id,
                'admin_id' => $admin->id,
            ]);

            return response()->json([
                'message' => 'Request approved successfully',
                'request' => $request->fresh(),
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            Log::warning('Unauthorized approval attempt', [
                'user_id' => auth()->id(),
                'request_id' => $request->id,
            ]);
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        } catch (\Exception $e) {
            Log::error('Failed to approve request', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to approve request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject request (admin only)
     * POST /api/requests/{id}/reject
     */
    public function reject(Request $httpRequest, PurchaseRequest $request): JsonResponse
    {
        try {
            $this->authorize('reject', $request);

            $validated = $httpRequest->validate([
                'rejection_reason' => 'required|string|max:500',
            ]);

            $admin = auth()->user();
            $this->requestService->rejectRequest(
                $request,
                $admin,
                $validated['rejection_reason']
            );

            Log::info('Purchase request rejected', [
                'request_id' => $request->id,
                'admin_id' => $admin->id,
            ]);

            return response()->json([
                'message' => 'Request rejected successfully',
                'request' => $request->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation error rejecting request', [
                'request_id' => $request->id,
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            Log::warning('Unauthorized rejection attempt', [
                'user_id' => auth()->id(),
                'request_id' => $request->id,
            ]);
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        } catch (\Exception $e) {
            Log::error('Failed to reject request', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to reject request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel request
     * POST /api/requests/{id}/cancel
     */
    public function cancel(PurchaseRequest $request): JsonResponse
    {
        try {
            $this->authorize('cancel', $request);

            $this->requestService->cancelRequest($request);

            Log::info('Purchase request cancelled', [
                'request_id' => $request->id,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'message' => 'Request cancelled successfully',
                'request' => $request->fresh(),
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            Log::warning('Unauthorized cancellation attempt', [
                'user_id' => auth()->id(),
                'request_id' => $request->id,
            ]);
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        } catch (\Exception $e) {
            Log::error('Failed to cancel request', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to cancel request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get pending requests for admin dashboard
     * GET /api/admin/requests
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            // Check if user is admin, staff, or caretaker
            $user = auth()->user();
            if (!$user instanceof Admin) {
                return response()->json([
                    'message' => 'Unauthorized - Admin access required',
                ], 403);
            }

            // Check access level
            $accessLevel = $user->access_level ?? $user->role;
            if (!in_array($accessLevel, ['admin', 'staff', 'caretaker'])) {
                return response()->json([
                    'message' => 'Forbidden - Insufficient permissions',
                ], 403);
            }

            $requests = $this->requestService->getPendingRequests(
                $request->query('search'),
                $request->query('sort', 'created_at'),
                $request->query('order', 'desc')
            );

            Log::info('Admin/Staff fetched pending requests', [
                'user_id' => auth()->id(),
                'access_level' => $accessLevel,
                'count' => $requests->count(),
            ]);

            return response()->json([
                'requests' => $requests,
                'count' => $requests->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch pending requests', [
                'admin_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch pending requests',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
