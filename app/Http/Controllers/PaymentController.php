<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function paymentSuccess(Request $request)
    {
        try {
            return response()->json([
                'message' => 'Payment successful',
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment success handling failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function paymentCancel(Request $request)
    {
        try {
            return response()->json([
                'message' => 'Payment cancelled',
                'status' => 'cancelled'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment cancel handling failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('Payment webhook received', $request->all());
            
            return response()->json([
                'message' => 'Webhook processed',
                'status' => 'received'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Webhook handling failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPaymentMethods()
    {
        try {
            $methods = [
                ['id' => 1, 'name' => 'Credit Card', 'enabled' => true],
                ['id' => 2, 'name' => 'Debit Card', 'enabled' => true],
                ['id' => 3, 'name' => 'Bank Transfer', 'enabled' => true],
                ['id' => 4, 'name' => 'GCash', 'enabled' => true],
                ['id' => 5, 'name' => 'GrabPay', 'enabled' => true],
            ];

            return response()->json([
                'methods' => $methods,
                'count' => count($methods)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch payment methods',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createPaymentIntent(Request $request)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'currency' => 'required|string',
                'description' => 'nullable|string',
            ]);

            return response()->json([
                'message' => 'Payment intent created',
                'intent_id' => 'pi_' . uniqid(),
                'amount' => $validated['amount'],
                'currency' => $validated['currency']
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment intent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createCheckoutSession(Request $request)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'currency' => 'required|string',
                'description' => 'nullable|string',
            ]);

            return response()->json([
                'message' => 'Checkout session created',
                'session_id' => 'cs_' . uniqid(),
                'amount' => $validated['amount'],
                'currency' => $validated['currency']
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create checkout session',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
