<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private $paymongoPublicKey;
    private $paymongoSecretKey;
    private $paymongoBaseUrl = 'https://api.paymongo.com/v1';

    public function __construct()
    {
        $this->paymongoPublicKey = config('services.paymongo.public_key') ?? env('PAYMONGO_PUBLIC_KEY');
        $this->paymongoSecretKey = config('services.paymongo.secret_key') ?? env('PAYMONGO_SECRET_KEY');
    }

    public function paymentSuccess(Request $request)
    {
        try {
            $sessionId = $request->query('session_id');
            $amount = $request->query('amount');
            $method = $request->query('method');
            
            Log::info('Payment success callback', [
                'session_id' => $sessionId,
                'amount' => $amount,
                'method' => $method
            ]);

            return response()->json([
                'message' => 'Payment successful',
                'status' => 'success',
                'session_id' => $sessionId,
                'amount' => $amount,
                'method' => $method
            ]);
        } catch (\Exception $e) {
            Log::error('Payment success handling failed', [
                'error' => $e->getMessage()
            ]);
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
            Log::info('Payment webhook received', $request->all());
            
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
                ['type' => 'card', 'name' => 'Credit/Debit Card', 'description' => 'Visa, Mastercard, etc.', 'enabled' => true],
                ['type' => 'gcash', 'name' => 'GCash', 'description' => 'Mobile wallet payment', 'enabled' => true],
                ['type' => 'grab_pay', 'name' => 'GrabPay', 'description' => 'Grab wallet payment', 'enabled' => true],
                ['type' => 'paymaya', 'name' => 'PayMaya', 'description' => 'PayMaya wallet', 'enabled' => true],
                ['type' => 'dob', 'name' => 'Bank Transfer', 'description' => 'Direct online banking', 'enabled' => true],
            ];

            return response()->json([
                'payment_methods' => $methods,
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

            // Convert amount to centavos (PayMongo uses centavos)
            $amountInCentavos = (int)($validated['amount'] * 100);

            $response = Http::withBasicAuth($this->paymongoSecretKey, '')
                ->post($this->paymongoBaseUrl . '/payment_intents', [
                    'data' => [
                        'attributes' => [
                            'amount' => $amountInCentavos,
                            'currency' => $validated['currency'] ?? 'PHP',
                            'description' => $validated['description'] ?? 'Payment',
                            'statement_descriptor' => 'SANCTUARIO',
                        ]
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'message' => 'Payment intent created',
                    'intent_id' => $data['data']['id'],
                    'client_secret' => $data['data']['attributes']['client_key'],
                    'amount' => $validated['amount'],
                    'currency' => $validated['currency']
                ], 201);
            } else {
                Log::error('PayMongo payment intent error', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                return response()->json([
                    'message' => 'Failed to create payment intent',
                    'error' => $response->json()['errors'][0]['detail'] ?? 'Unknown error'
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Payment intent creation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
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
                'description' => 'nullable|string',
                'payment_method' => 'required|string',
                'client_id' => 'required|integer',
                'customer_name' => 'nullable|string',
                'service_type' => 'nullable|string',
            ]);

            $secretKey = config('services.paymongo.secret_key') ?? env('PAYMONGO_SECRET_KEY');
            $publicKey = config('services.paymongo.public_key') ?? env('PAYMONGO_PUBLIC_KEY');
            
            Log::info('Creating PayMongo payment intent', [
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method']
            ]);

            $amountInCentavos = (int)($validated['amount'] * 100);
            $paymentMethodType = $this->mapPaymentMethod($validated['payment_method']);
            
            // Create payment intent
            $intentPayload = [
                'data' => [
                    'attributes' => [
                        'amount' => $amountInCentavos,
                        'currency' => 'PHP',
                        'description' => $validated['description'] ?? 'Payment',
                        'statement_descriptor' => 'SANCTUARIO',
                        'payment_method_allowed' => [$paymentMethodType]
                    ]
                ]
            ];

            $intentResponse = Http::withBasicAuth($secretKey, '')
                ->post($this->paymongoBaseUrl . '/payment_intents', $intentPayload);

            if (!$intentResponse->successful()) {
                $errorData = $intentResponse->json();
                Log::error('PayMongo payment intent error', [
                    'status' => $intentResponse->status(),
                    'error' => $errorData
                ]);
                return response()->json([
                    'message' => 'Failed to create payment intent',
                    'error' => $errorData['errors'][0]['detail'] ?? 'Unknown error'
                ], 400);
            }

            $intentData = $intentResponse->json();
            $intentId = $intentData['data']['id'];
            $clientKey = $intentData['data']['attributes']['client_key'];

            Log::info('Payment intent created', [
                'intent_id' => $intentId,
                'client_key' => $clientKey
            ]);

            // Return intent details for frontend to handle with PayMongo SDK
            return response()->json([
                'message' => 'Payment intent created',
                'session_id' => $intentId,
                'client_key' => $clientKey,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'intent_id' => $intentId
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Payment intent error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to create payment intent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function mapPaymentMethod($method)
    {
        $mapping = [
            'card' => 'card',
            'gcash' => 'gcash',
            'grab_pay' => 'grab_pay',
            'paymaya' => 'paymaya',
            'dob' => 'dob',
        ];

        return $mapping[$method] ?? 'card';
    }
}
