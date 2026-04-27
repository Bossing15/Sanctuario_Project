<?php

namespace App\Services;

use App\Models\Request as PurchaseRequest;
use App\Models\Admin;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class RequestService
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Create a new purchase request
     * 
     * @param int $userId
     * @param array $data
     * @return PurchaseRequest
     */
    public function createRequest(int $userId, array $data): PurchaseRequest
    {
        try {
            $request = PurchaseRequest::create([
                'user_id' => $userId,
                'product_id' => $data['product_id'] ?? null,
                'service_id' => $data['service_id'] ?? null,
                'payment_plan_id' => $data['payment_plan_id'],
                'lot_id' => $data['lot_id'],
                'lot_type' => $data['lot_type'],
                'deceased_name' => $data['deceased_name'],
                'deceased_date_of_death' => $data['deceased_date_of_death'],
                'deceased_relationship' => $data['deceased_relationship'] ?? null,
                'additional_deceased_info' => $data['additional_deceased_info'] ?? null,
                'status' => 'Pending_Approval',
                'status_history' => [
                    [
                        'status' => 'Pending_Approval',
                        'timestamp' => now()->toIso8601String(),
                    ],
                ],
            ]);

            Log::info('Purchase request created', [
                'request_id' => $request->id,
                'user_id' => $userId,
                'status' => 'Pending_Approval',
            ]);

            return $request;
        } catch (\Exception $e) {
            Log::error('Failed to create purchase request', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get user's requests with optional filtering and sorting
     * 
     * @param int $userId
     * @param string|null $status
     * @param string $sort
     * @param string $order
     * @return Collection
     */
    public function getUserRequests(
        int $userId,
        ?string $status = null,
        string $sort = 'created_at',
        string $order = 'desc'
    ): Collection {
        $query = PurchaseRequest::byUser($userId);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy($sort, $order)->get();
    }

    /**
     * Get all pending requests for admin dashboard with search functionality
     * 
     * @param string|null $search
     * @param string $sort
     * @param string $order
     * @return Collection
     */
    public function getPendingRequests(
        ?string $search = null,
        string $sort = 'created_at',
        string $order = 'desc'
    ): Collection {
        $query = PurchaseRequest::pending();

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('deceased_name', 'like', "%{$search}%");
        }

        return $query->orderBy($sort, $order)->get();
    }

    /**
     * Approve a request
     * 
     * @param PurchaseRequest $request
     * @param Admin $admin
     * @return void
     */
    public function approveRequest(PurchaseRequest $request, Admin $admin): void
    {
        try {
            $request->approve($admin);

            // Create a payment record for the approved request
            $payment = \App\Models\Payment::create([
                'client_id' => $request->user_id,
                'request_id' => $request->id,
                'invoice_number' => $request->invoice_number,
                'amount' => $request->amount ?? 0,
                'payment_method' => 'PayMongo',
                'payment_type' => 'full',
                'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                'status' => 'pending',
                'description' => 'Lawn Lot Reservation Payment',
                'due_date' => now()->addDays(30),
                'customer_name' => $request->deceased_name ?? 'Guest',
                'service_type' => 'reservation',
            ]);

            Log::info('Purchase request approved and payment created', [
                'request_id' => $request->id,
                'payment_id' => $payment->id,
                'admin_id' => $admin->id,
                'approved_at' => $request->approved_at,
            ]);

            $this->notificationService->sendApprovalNotification($request);
        } catch (\Exception $e) {
            Log::error('Failed to approve purchase request', [
                'request_id' => $request->id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Reject a request with reason
     * 
     * @param PurchaseRequest $request
     * @param Admin $admin
     * @param string $reason
     * @return void
     */
    public function rejectRequest(
        PurchaseRequest $request,
        Admin $admin,
        string $reason
    ): void {
        try {
            $request->reject($admin, $reason);

            Log::info('Purchase request rejected', [
                'request_id' => $request->id,
                'admin_id' => $admin->id,
                'rejected_at' => $request->rejected_at,
                'reason' => $reason,
            ]);

            $this->notificationService->sendRejectionNotification($request, $reason);
        } catch (\Exception $e) {
            Log::error('Failed to reject purchase request', [
                'request_id' => $request->id,
                'admin_id' => $admin->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Cancel a request
     * 
     * @param PurchaseRequest $request
     * @return void
     */
    public function cancelRequest(PurchaseRequest $request): void
    {
        try {
            $request->cancel();

            Log::info('Purchase request cancelled', [
                'request_id' => $request->id,
                'cancelled_at' => $request->cancelled_at,
            ]);

            $this->notificationService->sendCancellationNotification($request);
        } catch (\Exception $e) {
            Log::error('Failed to cancel purchase request', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
