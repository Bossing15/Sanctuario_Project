<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\AuthorizationService;
use App\Services\EmailNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private $paymongoPublicKey;
    private $paymongoSecretKey;
    private $paymongoBaseUrl = 'https://api.paymongo.com/v1';
    protected $authorizationService;
    protected $emailNotificationService;

    public function __construct(AuthorizationService $authorizationService, EmailNotificationService $emailNotificationService)
    {
        $this->paymongoPublicKey = config('services.paymongo.public_key') ?? env('PAYMONGO_PUBLIC_KEY');
        $this->paymongoSecretKey = config('services.paymongo.secret_key') ?? env('PAYMONGO_SECRET_KEY');
        $this->authorizationService = $authorizationService;
        $this->emailNotificationService = $emailNotificationService;
    }

    public function paymentSuccess(Request $request)
    {
        try {
            $paymentId = $request->query('payment_id');
            $sessionId = $request->query('session_id');
            
            Log::info('Payment success callback', [
                'payment_id' => $paymentId,
                'session_id' => $sessionId
            ]);

            // If we have a payment_id, retrieve the payment details
            if ($paymentId) {
                $payment = Payment::find($paymentId);
                
                if ($payment) {
                    // Update payment status to completed
                    $payment->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                        'paid_date' => now()
                    ]);

                    // If there's a booking associated with this payment, update its status
                    $booking = null;
                    if ($payment->booking_id) {
                        $booking = \App\Models\Booking::find($payment->booking_id);
                        if ($booking) {
                            $booking->update([
                                'status' => 'Paid'
                            ]);
                            Log::info('Booking marked as paid', [
                                'booking_id' => $booking->id,
                                'payment_id' => $payment->id
                            ]);
                        }
                    }

                    return response()->json([
                        'message' => 'Payment successful',
                        'status' => 'success',
                        'payment_id' => $payment->id,
                        'booking_id' => $payment->booking_id,
                        'amount' => $payment->amount,
                        'method' => $payment->payment_method,
                        'reference' => $payment->paymongo_intent_id,
                        'completed_at' => $payment->completed_at,
                        'booking' => $booking
                    ]);
                }
            }

            // Fallback if no payment_id
            return response()->json([
                'message' => 'Payment successful',
                'status' => 'success',
                'session_id' => $sessionId
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
                // Note: Bank Transfer (DOB) requires specific bank codes and may not be enabled on all accounts
                // Uncomment below if your PayMongo account has DOB enabled
                // ['type' => 'dob', 'name' => 'Bank Transfer', 'description' => 'Direct online banking', 'enabled' => true],
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
                'product_id' => 'nullable|integer',
                'plan_type' => 'nullable|string',
                'grave_id' => 'nullable|integer|exists:graves,id',
            ]);

            // If user is authenticated, use their ID instead of the provided client_id
            $clientId = $validated['client_id'];
            if ($request->user()) {
                $clientId = $request->user()->id;
                Log::info('Using authenticated user ID instead of provided client_id', [
                    'provided_id' => $validated['client_id'],
                    'authenticated_id' => $clientId
                ]);
            }

            Log::info('Checkout session request received', [
                'product_id' => $validated['product_id'] ?? 'null',
                'plan_type' => $validated['plan_type'] ?? 'null',
                'amount' => $validated['amount'],
                'client_id' => $clientId
            ]);

            $secretKey = config('services.paymongo.secret_key') ?? env('PAYMONGO_SECRET_KEY');
            $publicKey = config('services.paymongo.public_key') ?? env('PAYMONGO_PUBLIC_KEY');
            
            Log::info('Creating PayMongo checkout session', [
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method']
            ]);

            $amountInCentavos = (int)($validated['amount'] * 100);
            $paymentMethodType = $this->mapPaymentMethod($validated['payment_method']);
            
            // Create payment intent first
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
            Log::info('PayMongo intent response:', $intentData);
            $intentId = $intentData['data']['id'];
            $clientKey = $intentData['data']['attributes']['client_key'];

            Log::info('Payment intent created', [
                'intent_id' => $intentId,
                'client_key' => $clientKey
            ]);

            // Create checkout session
            $checkoutPayload = [
                'data' => [
                    'attributes' => [
                        'payment_intent_id' => $intentId,
                        'success_url' => 'http://localhost:3002/payment/success',
                        'cancel_url' => 'http://localhost:3002/payment/cancel',
                        'payment_method_types' => [$paymentMethodType],
                        'line_items' => [
                            [
                                'currency' => 'PHP',
                                'amount' => $amountInCentavos,
                                'description' => $validated['description'] ?? 'Payment',
                                'name' => $validated['customer_name'] ?? 'Payment',
                                'quantity' => 1
                            ]
                        ]
                    ]
                ]
            ];

            $checkoutResponse = Http::withBasicAuth($secretKey, '')
                ->post($this->paymongoBaseUrl . '/checkout_sessions', $checkoutPayload);

            if (!$checkoutResponse->successful()) {
                $errorData = $checkoutResponse->json();
                Log::error('PayMongo checkout session error', [
                    'status' => $checkoutResponse->status(),
                    'error' => $errorData
                ]);
                return response()->json([
                    'message' => 'Failed to create checkout session',
                    'error' => $errorData['errors'][0]['detail'] ?? 'Unknown error'
                ], 400);
            }

            $checkoutData = $checkoutResponse->json();
            Log::info('PayMongo checkout response:', $checkoutData);
            $checkoutUrl = $checkoutData['data']['attributes']['checkout_url'];
            $sessionId = $checkoutData['data']['id'];

            Log::info('Checkout session created', [
                'session_id' => $sessionId,
                'checkout_url' => $checkoutUrl
            ]);

            // Verify client exists before creating payment
            $client = \App\Models\Client::find($clientId);
            if (!$client) {
                Log::warning('Client not found, creating payment with null client_id', ['client_id' => $clientId]);
                // Allow payment creation with null client_id if client doesn't exist
                $clientId = null;
            }

            // Check if we're updating an existing payment
            $existingPaymentId = $request->input('existing_payment_id');
            if ($existingPaymentId) {
                // Update existing payment instead of creating a new one
                $payment = Payment::find($existingPaymentId);
                if ($payment) {
                    Log::info('Updating existing payment', [
                        'payment_id' => $existingPaymentId,
                        'old_status' => $payment->status,
                        'new_status' => 'pending'
                    ]);
                    
                    // Update the payment with new PayMongo details
                    $payment->update([
                        'paymongo_intent_id' => $intentId,
                        'paymongo_client_key' => $clientKey,
                        'status' => 'pending'
                    ]);
                } else {
                    Log::warning('Existing payment not found', ['payment_id' => $existingPaymentId]);
                    // Create new payment if existing one not found
                    $payment = Payment::create([
                        'client_id' => $clientId,
                        'booking_id' => null,
                        'grave_id' => null,
                        'service_id' => null,
                        'product_id' => $validated['product_id'] ?? null,
                        'amount' => $validated['amount'],
                        'payment_method' => $validated['payment_method'],
                        'payment_type' => 'full',
                        'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                        'status' => 'pending',
                        'description' => $validated['description'] ?? 'Payment',
                        'due_date' => now()->addDays(30),
                        'paymongo_intent_id' => $intentId,
                        'paymongo_client_key' => $clientKey,
                        'customer_name' => $validated['customer_name'] ?? 'Guest',
                        'service_type' => $validated['service_type'] ?? 'general',
                        'product_id' => $validated['product_id'] ?? null,
                    ]);
                }
            } else {
                // Create new payment
                $payment = Payment::create([
                    'client_id' => $clientId,
                    'booking_id' => null,
                    'grave_id' => null,
                    'service_id' => null,
                    'product_id' => $validated['product_id'] ?? null,
                    'amount' => $validated['amount'],
                    'payment_method' => $validated['payment_method'],
                    'payment_type' => 'full',
                    'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                    'status' => 'pending',
                    'description' => $validated['description'] ?? 'Payment',
                    'due_date' => now()->addDays(30),
                    'paymongo_intent_id' => $intentId,
                    'paymongo_client_key' => $clientKey,
                    'customer_name' => $validated['customer_name'] ?? 'Guest',
                    'service_type' => $validated['service_type'] ?? 'general',
                    'product_id' => $validated['product_id'] ?? null,
                ]);
            }

            // Create a booking record if product_id or service_id is provided
            $booking = null;
            if (!empty($validated['product_id']) || !empty($validated['service_id'])) {
                try {
                    $booking = \App\Models\Booking::create([
                        'user_id' => $clientId,
                        'service_id' => $validated['service_id'] ?? null,
                        'product_id' => $validated['product_id'] ?? null,
                        'grave_id' => $validated['grave_id'] ?? null,
                        'plan_type' => $validated['plan_type'] ?? 'Monthly',
                        'amount' => $validated['amount'],
                        'status' => 'ReadyForPayment',
                        'total_amount' => $validated['amount'],
                    ]);

                    // Determine authorization status
                    $authStatus = $this->authorizationService->determineAuthorizationStatus($booking);
                    $booking->update(['authorization_status' => $authStatus]);

                    Log::info('Booking created with authorization status', [
                        'booking_id' => $booking->id,
                        'authorization_status' => $authStatus,
                        'product_id' => $validated['product_id'] ?? null,
                        'service_id' => $validated['service_id'] ?? null,
                    ]);

                    // If authorization is required, don't create payment yet
                    if ($authStatus === 'PENDING_AUTHORIZATION') {
                        Log::info('Booking requires authorization, skipping payment creation', [
                            'booking_id' => $booking->id
                        ]);

                        // Send email notification to admin about pending request
                        $this->emailNotificationService->notifyAdminPendingRequest($booking);

                        return response()->json([
                            'message' => 'Your request is pending approval',
                            'status' => 'pending_authorization',
                            'booking_id' => $booking->id,
                            'authorization_status' => $authStatus,
                            'notification' => 'Your request is pending approval. You will be notified once approved.',
                            'next_step' => 'Wait for admin approval before proceeding with payment'
                        ], 202);
                    }

                    // If rejected, return error
                    if ($authStatus === 'REJECTED') {
                        Log::info('Booking rejected due to unavailable lot', [
                            'booking_id' => $booking->id
                        ]);

                        return response()->json([
                            'message' => 'Transaction cannot be processed',
                            'status' => 'rejected',
                            'booking_id' => $booking->id,
                            'reason' => 'The selected lot is not available or does not exist'
                        ], 400);
                    }

                    // Link the booking to the payment (for AUTO_APPROVED)
                    $payment->update(['booking_id' => $booking->id]);
                    
                    Log::info('Booking created successfully with auto-approval', [
                        'booking_id' => $booking->id,
                        'payment_id' => $payment->id,
                        'grave_id' => $validated['grave_id'] ?? null
                    ]);
                } catch (\Exception $bookingError) {
                    Log::error('Failed to create booking', [
                        'error' => $bookingError->getMessage(),
                        'product_id' => $validated['product_id'] ?? null,
                        'service_id' => $validated['service_id'] ?? null,
                        'user_id' => $clientId
                    ]);
                }
            }

            Log::info('Payment record created', [
                'payment_id' => $payment->id,
                'booking_id' => $booking?->id,
                'intent_id' => $intentId
            ]);

            // Return checkout URL for frontend to redirect to
            return response()->json([
                'message' => 'Checkout session created',
                'payment_id' => $payment->id,
                'session_id' => $sessionId,
                'checkout_url' => $checkoutUrl,
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
            'dob' => 'dob_ubp', // UnionBank Online - default DOB option
            'dob_ubp' => 'dob_ubp',
            'dob_bpi' => 'dob_bpi',
        ];

        return $mapping[$method] ?? 'card';
    }

    public function sendReceipt(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'payment_id' => 'nullable|integer',
                'receipt_number' => 'required|string',
                'amount' => 'required|numeric',
                'method' => 'required|string',
                'transaction_id' => 'required|string',
                'description' => 'nullable|string'
            ]);

            $user = $request->user();
            
            // Verify the email matches the user's email
            if ($validated['email'] !== $user->email) {
                return response()->json([
                    'message' => 'Email does not match your account email',
                    'error' => 'Unauthorized'
                ], 403);
            }

            // Generate receipt HTML
            $receiptHTML = $this->generateReceiptHTML(
                $validated['receipt_number'],
                $validated['amount'],
                $validated['method'],
                $validated['transaction_id'],
                $validated['description'],
                $user->name,
                $user->email
            );

            // Send email with receipt
            \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($validated, $receiptHTML) {
                $message->to($validated['email'])
                    ->subject('Payment Receipt - Sanctuario De Carmona')
                    ->html($receiptHTML);
            });

            Log::info('Receipt email sent', [
                'email' => $validated['email'],
                'receipt_number' => $validated['receipt_number']
            ]);

            return response()->json([
                'message' => 'Receipt sent successfully',
                'email' => $validated['email']
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Send receipt error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to send receipt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function generateReceiptHTML($receiptNumber, $amount, $method, $transactionId, $description, $userName, $userEmail)
    {
        $formattedAmount = number_format($amount, 2);
        $date = now()->format('F d, Y h:i A');

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - {$receiptNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .receipt-container { max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ddd; padding: 30px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #333; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; font-size: 14px; }
        .section { margin: 25px 0; }
        .section-title { font-weight: bold; font-size: 14px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 8px; color: #333; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row .label { font-weight: 500; color: #555; }
        .detail-row .value { text-align: right; color: #333; }
        .amount-row { font-size: 16px; font-weight: bold; color: #27ae60; border-bottom: 2px solid #27ae60; padding: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; color: #666; font-size: 12px; }
        .status { text-align: center; color: #27ae60; font-weight: bold; font-size: 18px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>Sanctuario De Carmona</h1>
            <p>Memorial Park</p>
            <p>Payment Receipt</p>
        </div>
        
        <div class="status">✓ PAYMENT SUCCESSFUL</div>
        
        <div class="section">
            <div class="section-title">Receipt Information</div>
            <div class="detail-row">
                <span class="label">Receipt Number:</span>
                <span class="value">{$receiptNumber}</span>
            </div>
            <div class="detail-row">
                <span class="label">Date & Time:</span>
                <span class="value">{$date}</span>
            </div>
            <div class="detail-row">
                <span class="label">Transaction ID:</span>
                <span class="value">{$transactionId}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">{$userName}</span>
            </div>
            <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">{$userEmail}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Payment Details</div>
            <div class="detail-row">
                <span class="label">Description:</span>
                <span class="value">{$description}</span>
            </div>
            <div class="detail-row">
                <span class="label">Payment Method:</span>
                <span class="value">{$method}</span>
            </div>
            <div class="detail-row amount-row">
                <span class="label">Amount Paid:</span>
                <span class="value">₱{$formattedAmount}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Status</div>
            <div class="detail-row">
                <span class="label">Payment Status:</span>
                <span class="value" style="color: #27ae60; font-weight: bold;">COMPLETED</span>
            </div>
            <div class="detail-row">
                <span class="label">Processing Status:</span>
                <span class="value">Pending (1-2 business days)</span>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for your payment!</p>
            <p>For inquiries, please contact us at info@sanctuario.com or call 1-888-881-6131</p>
            <p>This is an automated receipt. Please keep this for your records.</p>
            <p style="margin-top: 20px;">Generated on {$date}</p>
        </div>
    </div>
</body>
</html>
HTML;
    }
}
