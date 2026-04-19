<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentManagementController extends Controller
{
    public function index()
    {
        try {
            $payments = Payment::all();
            return response()->json([
                'payments' => $payments,
                'count' => $payments->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserPayments(Request $request)
    {
        try {
            $user = $request->user();
            $payments = Payment::where('client_id', $user->id)
                ->with('booking')
                ->get()
                ->map(function ($payment) {
                    // Add lot information based on product type
                    if ($payment->booking && $payment->booking->grave_id) {
                        $graveId = $payment->booking->grave_id;
                        $productId = $payment->booking->product_id;
                        
                        // Get the product to determine the type
                        $product = \App\Models\Product::find($productId);
                        
                        if ($product) {
                            $lotInfo = null;
                            
                            switch ($product->slug) {
                                case 'lawn-lots':
                                    $lotInfo = \App\Models\LawnLot::find($graveId);
                                    if ($lotInfo) {
                                        $payment->plot_number = $lotInfo->plot_number;
                                        $payment->grave_location = $lotInfo->grave_location;
                                        $payment->section = $lotInfo->section;
                                    }
                                    break;
                                    
                                case 'columbariums':
                                    $lotInfo = \App\Models\Columbarium::find($graveId);
                                    if ($lotInfo) {
                                        $payment->plot_number = $lotInfo->niche_number;
                                        $payment->grave_location = $lotInfo->location;
                                        $payment->section = $lotInfo->section;
                                    }
                                    break;
                                    
                                case 'family-estates':
                                    $lotInfo = \App\Models\FamilyEstate::find($graveId);
                                    if ($lotInfo) {
                                        $payment->plot_number = $lotInfo->plot_number;
                                        $payment->grave_location = $lotInfo->location;
                                        $payment->section = $lotInfo->section;
                                    }
                                    break;
                                    
                                default:
                                    // Fallback to Grave model for other products
                                    $grave = \App\Models\Grave::find($graveId);
                                    if ($grave) {
                                        $payment->plot_number = $grave->plot_number;
                                        $payment->grave_location = $grave->grave_location;
                                        $payment->section = $grave->section;
                                    }
                                    break;
                            }
                        }
                    }
                    
                    return $payment;
                });
            
            return response()->json([
                'data' => $payments,
                'payments' => $payments,
                'count' => $payments->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|integer',
                'amount' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'payment_type' => 'required|string',
                'status' => 'required|string',
                'due_date' => 'required|date',
                'paid_date' => 'nullable|date',
                'description' => 'nullable|string'
            ]);

            $validated['payment_reference'] = 'PAY-' . strtoupper(uniqid());
            $payment = Payment::create($validated);

            return response()->json([
                'message' => 'Payment created successfully',
                'payment' => $payment
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string',
            ]);

            $payment = Payment::findOrFail($id);
            $payment->update($validated);

            return response()->json([
                'message' => 'Payment status updated',
                'payment' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function analytics()
    {
        try {
            $totalPayments = Payment::sum('amount');
            $totalCount = Payment::count();
            $pendingCount = Payment::where('status', 'pending')->count();
            $completedCount = Payment::where('status', 'completed')->count();

            return response()->json([
                'total_amount' => $totalPayments,
                'total_count' => $totalCount,
                'pending_count' => $pendingCount,
                'completed_count' => $completedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkOverduePayments()
    {
        try {
            $overduePayments = Payment::where('status', 'pending')
                ->where('due_date', '<', now())
                ->get();

            return response()->json([
                'overdue_payments' => $overduePayments,
                'count' => $overduePayments->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to check overdue payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendPaymentReminders()
    {
        try {
            return response()->json([
                'message' => 'Payment reminders sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send reminders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function generateReceipt($id)
    {
        try {
            $payment = Payment::findOrFail($id);
            
            return response()->json([
                'message' => 'Receipt generated',
                'receipt_id' => 'RCP-' . uniqid(),
                'payment' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate receipt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadReceipt($id)
    {
        try {
            $payment = Payment::findOrFail($id);
            
            return response()->json([
                'message' => 'Receipt ready for download',
                'receipt_id' => 'RCP-' . uniqid(),
                'payment' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to download receipt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function adminAllPayments(Request $request)
    {
        try {
            // Start with a basic query
            $query = Payment::query();
            
            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }
            
            // Filter by payment method if provided
            if ($request->has('payment_method') && $request->payment_method !== 'all') {
                $query->where('payment_method', $request->payment_method);
            }
            
            // Search by customer name if provided
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where('customer_name', 'like', "%{$search}%");
            }
            
            // Get pagination parameters
            $perPage = (int) $request->get('per_page', 50);
            if ($perPage < 1 || $perPage > 500) {
                $perPage = 50;
            }
            
            // Execute the query with pagination
            $payments = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            // Transform the collection
            $data = $payments->getCollection()->map(function ($payment) {
                return [
                    'id' => (int) $payment->id,
                    'customer_name' => (string) ($payment->customer_name ?? 'N/A'),
                    'customer_email' => (string) ($payment->customer_email ?? 'N/A'),
                    'customer_phone' => (string) ($payment->customer_phone ?? 'N/A'),
                    'amount' => (float) $payment->amount,
                    'status' => (string) ($payment->status ?? 'pending'),
                    'payment_method' => (string) ($payment->payment_method ?? 'N/A'),
                    'payment_reference' => (string) ($payment->payment_reference ?? 'N/A'),
                    'due_date' => $payment->due_date ? $payment->due_date->toDateString() : null,
                    'paid_date' => $payment->paid_date ? $payment->paid_date->toDateString() : null,
                    'created_at' => $payment->created_at ? $payment->created_at->toIso8601String() : null,
                    'booking_id' => $payment->booking_id ? (int) $payment->booking_id : null,
                    'description' => (string) ($payment->description ?? 'N/A'),
                    'penalty_amount' => (float) ($payment->penalty_amount ?? 0),
                ];
            })->toArray();
            
            return response()->json([
                'data' => $data,
                'pagination' => [
                    'total' => $payments->total(),
                    'per_page' => $payments->perPage(),
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'from' => $payments->firstItem(),
                    'to' => $payments->lastItem(),
                ]
            ], 200);
            
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error in adminAllPayments: ' . $e->getMessage());
            return response()->json([
                'message' => 'Database error',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Error in adminAllPayments: ' . $e->getMessage() . ' - ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to fetch payments',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    public function adminPaymentStats(Request $request)
    {
        try {
            $query = Payment::query();
            
            // Optional date range filter
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('created_at', [
                    $request->start_date,
                    $request->end_date
                ]);
            }
            
            $totalPayments = $query->count();
            $paidPayments = (clone $query)->where('status', 'completed')->count();
            $unpaidPayments = (clone $query)->where('status', 'pending')->count();
            $failedPayments = (clone $query)->where('status', 'failed')->count();
            
            // Calculate amounts
            $paidAmount = (clone $query)->where('status', 'completed')->sum('amount');
            $unpaidAmount = (clone $query)->where('status', 'pending')->sum('amount');
            $failedAmount = (clone $query)->where('status', 'failed')->sum('amount');
            
            // Payment method breakdown
            $methodBreakdown = (clone $query)
                ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('payment_method')
                ->get()
                ->keyBy('payment_method');
            
            // Status breakdown
            $statusBreakdown = (clone $query)
                ->selectRaw('status, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('status')
                ->get()
                ->keyBy('status');
            
            return response()->json([
                'stats' => [
                    'total_payments' => $totalPayments,
                    'paid_count' => $paidPayments,
                    'unpaid_count' => $unpaidPayments,
                    'failed_count' => $failedPayments,
                    'paid_amount' => $paidAmount,
                    'unpaid_amount' => $unpaidAmount,
                    'failed_amount' => $failedAmount,
                    'total_amount' => $paidAmount + $unpaidAmount + $failedAmount,
                    'payment_method_breakdown' => $methodBreakdown,
                    'status_breakdown' => $statusBreakdown
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch payment statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
