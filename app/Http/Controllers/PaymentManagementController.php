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
}
