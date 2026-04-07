<?php

namespace App\Http\Controllers;

use App\Models\PaymentPlan;
use Illuminate\Http\Request;

class PaymentPlanController extends Controller
{
    public function index()
    {
        try {
            $plans = PaymentPlan::all();
            return response()->json([
                'plans' => $plans,
                'count' => $plans->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch payment plans',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|integer',
                'total_amount' => 'required|numeric|min:0',
                'installment_count' => 'required|integer|min:1',
                'installment_amount' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'end_date' => 'required|date',
                'status' => 'required|string',
            ]);

            $plan = PaymentPlan::create($validated);

            return response()->json([
                'message' => 'Payment plan created successfully',
                'plan' => $plan
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $plan = PaymentPlan::findOrFail($id);
            return response()->json(['plan' => $plan]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment plan not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'total_amount' => 'nullable|numeric|min:0',
                'installment_count' => 'nullable|integer|min:1',
                'installment_amount' => 'nullable|numeric|min:0',
                'status' => 'nullable|string',
            ]);

            $plan = PaymentPlan::findOrFail($id);
            $plan->update($validated);

            return response()->json([
                'message' => 'Payment plan updated successfully',
                'plan' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update payment plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function processInstallment($id, Request $request)
    {
        try {
            $plan = PaymentPlan::findOrFail($id);
            
            return response()->json([
                'message' => 'Installment processed successfully',
                'plan' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process installment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancel($id)
    {
        try {
            $plan = PaymentPlan::findOrFail($id);
            $plan->update(['status' => 'cancelled']);

            return response()->json([
                'message' => 'Payment plan cancelled',
                'plan' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to cancel payment plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
