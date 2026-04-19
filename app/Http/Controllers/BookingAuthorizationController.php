<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\AuthorizationService;
use App\Services\EmailNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BookingAuthorizationController extends Controller
{
    protected $authorizationService;
    protected $emailNotificationService;

    public function __construct(AuthorizationService $authorizationService, EmailNotificationService $emailNotificationService)
    {
        $this->authorizationService = $authorizationService;
        $this->emailNotificationService = $emailNotificationService;
    }

    /**
     * Get all pending authorization requests
     */
    public function getPendingRequests(Request $request)
    {
        try {
            $bookings = Booking::where('authorization_status', 'PENDING_AUTHORIZATION')
                ->with(['user', 'service', 'product', 'approver'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($booking) {
                    return $this->formatBookingForAdmin($booking);
                });

            return response()->json([
                'message' => 'Pending authorization requests retrieved',
                'requests' => $bookings,
                'count' => $bookings->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching pending requests', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to fetch pending requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a booking request
     */
    public function approveRequest(Request $request, $bookingId)
    {
        try {
            $admin = $request->user();
            if (!$admin || !in_array($admin->access_level ?? $admin->role, ['admin', 'staff'])) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $booking = Booking::findOrFail($bookingId);

            if ($booking->authorization_status !== 'PENDING_AUTHORIZATION') {
                return response()->json([
                    'message' => 'Booking is not pending authorization',
                    'current_status' => $booking->authorization_status
                ], 400);
            }

            // Update booking status
            $booking->update([
                'authorization_status' => 'AUTHORIZED',
                'approved_by' => $admin->id,
                'approved_at' => now()
            ]);

            // Send email notification to customer
            $this->emailNotificationService->notifyCustomerApproved($booking);

            Log::info('Booking approved', [
                'booking_id' => $booking->id,
                'approved_by' => $admin->id,
                'admin_name' => $admin->name
            ]);

            return response()->json([
                'message' => 'Booking approved successfully',
                'booking' => $this->formatBookingForAdmin($booking),
                'next_step' => 'Customer can now proceed with payment'
            ]);
        } catch (\Exception $e) {
            Log::error('Error approving booking', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to approve booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a booking request
     */
    public function rejectRequest(Request $request, $bookingId)
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string|max:500'
            ]);

            $admin = $request->user();
            if (!$admin || !in_array($admin->access_level ?? $admin->role, ['admin', 'staff'])) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $booking = Booking::findOrFail($bookingId);

            if ($booking->authorization_status !== 'PENDING_AUTHORIZATION') {
                return response()->json([
                    'message' => 'Booking is not pending authorization',
                    'current_status' => $booking->authorization_status
                ], 400);
            }

            // Update booking status
            $booking->update([
                'authorization_status' => 'REJECTED',
                'rejection_reason' => $validated['reason'],
                'rejected_at' => now()
            ]);

            // Send email notification to customer
            $this->emailNotificationService->notifyCustomerRejected($booking);

            Log::info('Booking rejected', [
                'booking_id' => $booking->id,
                'rejected_by' => $admin->id,
                'admin_name' => $admin->name,
                'reason' => $validated['reason']
            ]);

            return response()->json([
                'message' => 'Booking rejected successfully',
                'booking' => $this->formatBookingForAdmin($booking)
            ]);
        } catch (\Exception $e) {
            Log::error('Error rejecting booking', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to reject booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authorization statistics
     */
    public function getStats(Request $request)
    {
        try {
            $stats = [
                'pending' => Booking::where('authorization_status', 'PENDING_AUTHORIZATION')->count(),
                'authorized' => Booking::where('authorization_status', 'AUTHORIZED')->count(),
                'auto_approved' => Booking::where('authorization_status', 'AUTO_APPROVED')->count(),
                'rejected' => Booking::where('authorization_status', 'REJECTED')->count(),
            ];

            return response()->json([
                'message' => 'Authorization statistics retrieved',
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching stats', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format booking data for admin display
     */
    private function formatBookingForAdmin($booking)
    {
        return [
            'id' => $booking->id,
            'customer' => [
                'id' => $booking->user_id,
                'name' => $booking->user->name ?? 'N/A',
                'email' => $booking->user->email ?? 'N/A',
                'phone' => $booking->user->phone ?? 'N/A',
            ],
            'product' => $booking->product ? [
                'id' => $booking->product->id,
                'name' => $booking->product->title,
                'slug' => $booking->product->slug,
            ] : null,
            'service' => $booking->service ? [
                'id' => $booking->service->id,
                'name' => $booking->service->title,
                'slug' => $booking->service->slug,
            ] : null,
            'lot_id' => $booking->grave_id,
            'plan_type' => $booking->plan_type,
            'amount' => $booking->amount,
            'booking_date' => $booking->booking_date,
            'status' => $booking->status,
            'authorization_status' => $booking->authorization_status,
            'authorization_status_label' => $this->authorizationService->getStatusLabel($booking->authorization_status),
            'approved_by' => $booking->approver ? $booking->approver->name : null,
            'approved_at' => $booking->approved_at,
            'rejection_reason' => $booking->rejection_reason,
            'rejected_at' => $booking->rejected_at,
            'created_at' => $booking->created_at,
        ];
    }
}
