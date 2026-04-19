<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\RequirementSubmission;
use App\Services\AuthorizationService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $authorizationService;

    public function __construct(AuthorizationService $authorizationService)
    {
        $this->authorizationService = $authorizationService;
    }

    public function create(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'nullable|integer',
                'client_id' => 'nullable|integer',
                'service_id' => 'nullable|integer',
                'product_id' => 'nullable|integer',
                'plan_type' => 'nullable|string',
                'amount' => 'nullable|numeric',
                'total_amount' => 'nullable|numeric',
                'status' => 'nullable|string',
                'grave_id' => 'nullable|integer',
                'booking_date' => 'nullable|date',
                'notes' => 'nullable|string',
            ]);

            // Use user_id if provided, otherwise use client_id for backward compatibility
            if (!$validated['user_id'] && $validated['client_id']) {
                $validated['user_id'] = $validated['client_id'];
            }
            
            // Remove client_id to avoid conflicts
            unset($validated['client_id']);
            
            // Set default total_amount if not provided
            if (!$validated['total_amount'] && $validated['amount']) {
                $validated['total_amount'] = $validated['amount'];
            }

            $booking = Booking::create($validated);

            // Determine authorization status based on booking details
            $authStatus = $this->authorizationService->determineAuthorizationStatus($booking);
            $booking->update(['authorization_status' => $authStatus]);

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $booking = Booking::findOrFail($id);
            
            // Determine if payment is allowed
            $can_pay = true; // Allow payment by default for pending payments
            
            return response()->json([
                'booking' => $booking,
                'can_pay' => $can_pay
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Booking not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function getUserBookings($userId)
    {
        try {
            $bookings = Booking::where('user_id', $userId)->with('service', 'product')->get();
            return response()->json([
                'data' => $bookings,
                'bookings' => $bookings,
                'count' => $bookings->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch bookings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function submitRequirements($bookingId, Request $request)
    {
        try {
            $booking = Booking::findOrFail($bookingId);
            $booking->update(['status' => 'requirements_submitted']);
            
            return response()->json([
                'message' => 'Requirements submitted successfully',
                'booking' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function pay($bookingId, Request $request)
    {
        try {
            $booking = Booking::findOrFail($bookingId);
            $booking->update(['status' => 'paid']);
            
            return response()->json([
                'message' => 'Payment processed successfully',
                'booking' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function adminIndex()
    {
        try {
            $bookings = Booking::all();
            return response()->json([
                'bookings' => $bookings,
                'count' => $bookings->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch bookings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus($bookingId, Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string',
            ]);

            $booking = Booking::findOrFail($bookingId);
            $booking->update($validated);

            return response()->json([
                'message' => 'Booking status updated',
                'booking' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update booking status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reviewRequirements($bookingId, Request $request)
    {
        try {
            $booking = Booking::findOrFail($bookingId);
            $booking->update(['status' => 'requirements_reviewed']);
            
            return response()->json([
                'message' => 'Requirements reviewed',
                'booking' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to review requirements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function adminAllBookings(Request $request)
    {
        try {
            $query = Booking::with('user', 'service', 'product');
            
            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }
            
            // Filter by customer
            if ($request->has('customer_id')) {
                $query->where('user_id', $request->customer_id);
            }
            
            // Filter by product type
            if ($request->has('product_type')) {
                $query->where('product_id', $request->product_type);
            }
            
            // Search by customer name or email
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
            
            // Pagination
            $perPage = $request->get('per_page', 50);
            $bookings = $query->orderBy('booking_date', 'desc')->paginate($perPage);
            
            // Enrich with customer details
            $bookings->getCollection()->transform(function ($booking) {
                return [
                    'id' => $booking->id,
                    'customer_name' => $booking->user->name ?? 'N/A',
                    'customer_email' => $booking->user->email ?? 'N/A',
                    'customer_phone' => $booking->user->phone ?? 'N/A',
                    'product_service' => $booking->product->name ?? $booking->service->name ?? 'N/A',
                    'product_type' => $booking->product ? 'Product' : 'Service',
                    'amount' => $booking->amount,
                    'total_amount' => $booking->total_amount,
                    'status' => $booking->status,
                    'booking_date' => $booking->booking_date,
                    'authorization_status' => $booking->authorization_status,
                    'payment_status' => $booking->payment ? $booking->payment->status : 'unpaid',
                    'booking' => $booking
                ];
            });
            
            return response()->json([
                'data' => $bookings->items(),
                'pagination' => [
                    'total' => $bookings->total(),
                    'per_page' => $bookings->perPage(),
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                    'from' => $bookings->firstItem(),
                    'to' => $bookings->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch bookings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function adminBookingStats(Request $request)
    {
        try {
            $query = Booking::query();
            
            // Optional date range filter
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('booking_date', [
                    $request->start_date,
                    $request->end_date
                ]);
            }
            
            $totalBookings = $query->count();
            $pendingBookings = (clone $query)->where('status', 'pending')->count();
            $completedBookings = (clone $query)->where('status', 'completed')->count();
            $cancelledBookings = (clone $query)->where('status', 'cancelled')->count();
            
            // Calculate total revenue from completed bookings
            $totalRevenue = (clone $query)
                ->where('status', 'completed')
                ->sum('total_amount');
            
            // Get status breakdown
            $statusBreakdown = (clone $query)
                ->selectRaw('status, COUNT(*) as count, SUM(total_amount) as revenue')
                ->groupBy('status')
                ->get()
                ->keyBy('status');
            
            return response()->json([
                'stats' => [
                    'total_bookings' => $totalBookings,
                    'pending' => $pendingBookings,
                    'completed' => $completedBookings,
                    'cancelled' => $cancelledBookings,
                    'total_revenue' => $totalRevenue,
                    'status_breakdown' => $statusBreakdown
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch booking statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
