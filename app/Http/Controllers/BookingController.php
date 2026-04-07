<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\RequirementSubmission;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function create(Request $request)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|integer',
                'service_id' => 'required|integer',
                'grave_id' => 'nullable|integer',
                'booking_date' => 'required|date',
                'notes' => 'nullable|string',
            ]);

            $booking = Booking::create($validated);

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
            return response()->json(['booking' => $booking]);
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
            $bookings = Booking::where('client_id', $userId)->get();
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
}
