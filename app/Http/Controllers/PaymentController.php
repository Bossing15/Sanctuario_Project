<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Request as PurchaseRequest;
use App\Services\AuthorizationService;
use App\Services\EmailNotificationService;
use App\Services\SmsService;
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
    protected $smsService;

    public function __construct(AuthorizationService $authorizationService, EmailNotificationService $emailNotificationService, SmsService $smsService)
    {
        $environment = config('services.paymongo.environment', 'test');
        
        if ($environment === 'test') {
            $this->paymongoPublicKey = config('services.paymongo.test_public_key') ?? env('PAYMONGO_TEST_PUBLIC_KEY');
            $this->paymongoSecretKey = config('services.paymongo.test_secret_key') ?? env('PAYMONGO_TEST_SECRET_KEY');
        } else {
            $this->paymongoPublicKey = config('services.paymongo.public_key') ?? env('PAYMONGO_PUBLIC_KEY');
            $this->paymongoSecretKey = config('services.paymongo.secret_key') ?? env('PAYMONGO_SECRET_KEY');
        }
        
        $this->authorizationService = $authorizationService;
        $this->emailNotificationService = $emailNotificationService;
        $this->smsService = $smsService;
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

                    // Get the client associated with this payment
                    $client = null;
                    if ($payment->client_id) {
                        $client = \App\Models\Client::find($payment->client_id);
                    }

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

                    // If there's an inquiry (maintenance request) associated with this payment, update it
                    if ($payment->request_id) {
                        $inquiry = \App\Models\Inquiry::find($payment->request_id);
                        if ($inquiry) {
                            $inquiry->update([
                                'payment_id' => $payment->id,
                                'transaction_id' => $payment->paymongo_intent_id ?? $payment->payment_reference,
                                'payment_status' => 'completed',
                                'paid_at' => now(),
                                'status' => 'paid'
                            ]);
                            Log::info('Inquiry marked as paid', [
                                'inquiry_id' => $inquiry->id,
                                'payment_id' => $payment->id,
                                'transaction_id' => $payment->paymongo_intent_id ?? $payment->payment_reference
                            ]);
                        }
                    }

                    // If there's a reservation associated with this payment, update it
                    if ($payment->reservation_id) {
                        $reservation = \App\Models\Reservation::find($payment->reservation_id);
                        if ($reservation) {
                            $reservation->update([
                                'status' => 'paid',
                                'paid_at' => now()
                            ]);
                            Log::info('Reservation marked as paid', [
                                'reservation_id' => $reservation->id,
                                'payment_id' => $payment->id
                            ]);
                        }
                    }

                    // Send SMS notification to client if phone number is available
                    if ($client && $client->phone) {
                        $this->sendPaymentSuccessSms($client, $payment);
                    }

                    // Return HTML page that redirects to client app
                    $clientUrl = config('app.client_url', 'http://localhost:3000');
                    return view('payment-success', [
                        'clientUrl' => $clientUrl,
                        'paymentId' => $paymentId
                    ]);
                }
            }

            // Fallback if no payment_id
            $clientUrl = config('app.client_url', 'http://localhost:3000');
            return view('payment-success', [
                'clientUrl' => $clientUrl,
                'paymentId' => null
            ]);
        } catch (\Exception $e) {
            Log::error('Payment success handling failed', [
                'error' => $e->getMessage()
            ]);
            $clientUrl = config('app.client_url', 'http://localhost:3000');
            return view('payment-error', [
                'clientUrl' => $clientUrl,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send payment success SMS notification to client
     */
    private function sendPaymentSuccessSms($client, $payment)
    {
        try {
            // Format the amount
            $amount = number_format($payment->amount, 2);
            
            // Create formal payment confirmation message
            $message = "Dear {$client->name}, your payment of ₱{$amount} has been successfully received by Sanctuario De Carmona Memorial Park. Reference: {$payment->payment_reference}. Thank you for your trust.";
            
            // Ensure message doesn't exceed 160 characters (SMS standard)
            if (strlen($message) > 160) {
                $message = "Payment of ₱{$amount} received successfully. Ref: {$payment->payment_reference}. Thank you, Sanctuario De Carmona.";
            }
            
            // Send SMS via SMS service
            $result = $this->smsService->sendSms(
                $client->phone,
                $message,
                'payment_success_' . $payment->id
            );
            
            if ($result['success']) {
                Log::info('Payment success SMS sent', [
                    'client_id' => $client->id,
                    'payment_id' => $payment->id,
                    'phone' => $this->maskPhoneNumber($client->phone)
                ]);
            } else {
                Log::warning('Failed to send payment success SMS', [
                    'client_id' => $client->id,
                    'payment_id' => $payment->id,
                    'error' => $result['message'] ?? 'Unknown error'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error sending payment success SMS', [
                'client_id' => $client->id ?? null,
                'payment_id' => $payment->id ?? null,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Mask phone number for logging
     */
    private function maskPhoneNumber($phoneNumber)
    {
        $length = strlen($phoneNumber);
        $visibleChars = 4;
        $maskedChars = str_repeat('*', $length - $visibleChars);
        return substr($phoneNumber, 0, $visibleChars) . $maskedChars;
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
            
            $data = $request->all();
            
            // Check if this is a payment.paid event
            if (isset($data['data']['attributes']['type']) && $data['data']['attributes']['type'] === 'payment.paid') {
                $paymentId = $data['data']['attributes']['data']['id'] ?? null;
                
                if ($paymentId) {
                    // Find the payment record
                    $payment = Payment::where('paymongo_intent_id', $paymentId)->first();
                    
                    if ($payment) {
                        // Update payment status
                        $payment->update([
                            'status' => 'completed',
                            'paid_date' => now(),
                            'completed_at' => now(),
                        ]);
                        
                        // If this is a reservation payment, update reservation status
                        if ($payment->reservation_id) {
                            $reservation = Reservation::find($payment->reservation_id);
                            if ($reservation) {
                                $reservation->update([
                                    'status' => 'paid',
                                ]);
                                
                                Log::info('Reservation marked as paid via webhook', [
                                    'reservation_id' => $reservation->id,
                                    'payment_id' => $payment->id,
                                ]);
                            }
                        }
                        
                        Log::info('Payment marked as completed via webhook', [
                            'payment_id' => $payment->id,
                        ]);
                    }
                }
            }
            
            return response()->json([
                'message' => 'Webhook processed',
                'status' => 'received'
            ]);
        } catch (\Exception $e) {
            Log::error('Webhook handling error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
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
                            'payment_method_allowed' => ['card', 'gcash', 'grab_pay', 'paymaya'],
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
            Log::info('createCheckoutSession called', [
                'method' => $request->method(),
                'all_data' => $request->all()
            ]);

            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'payment_method' => 'required|string',
                'client_id' => 'required|integer',
                'customer_name' => 'nullable|string',
                'service_type' => 'nullable|string',
                'product_id' => 'nullable|integer',
                'plan_type' => 'nullable|string',
                'grave_id' => 'nullable|integer',
                'lot_id' => 'nullable|integer',
                'lot_type' => 'nullable|string',
                'payment_plan_id' => 'nullable|integer',
                'deceased_name' => 'nullable|string|max:255',
                'deceased_date_of_death' => 'nullable|date|before_or_equal:today',
                'deceased_relationship' => 'nullable|string|max:100',
                'additional_deceased_info' => 'nullable|array',
            ]);

            Log::info('Validation passed', ['validated' => $validated]);

            // Normalize lot_type to match database enum values if provided
            if (!empty($validated['lot_type'])) {
                $lotTypeMap = [
                    'lawn-lots' => 'LawnLot',
                    'lawlots' => 'LawnLot',
                    'lawnlot' => 'LawnLot',
                    'columbariums' => 'Columbarium',
                    'columbarium' => 'Columbarium',
                    'family-estates' => 'FamilyEstate',
                    'familyestates' => 'FamilyEstate',
                    'familyestate' => 'FamilyEstate',
                ];
                
                $lotType = strtolower($validated['lot_type']);
                $validated['lot_type'] = $lotTypeMap[$lotType] ?? 'LawnLot';

                Log::info('Lot type normalized', ['original' => $lotType, 'normalized' => $validated['lot_type']]);
            }

            // If user is authenticated, use their ID instead of the provided client_id
            $clientId = $validated['client_id'];
            if ($request->user()) {
                $clientId = $request->user()->id;
                Log::info('Using authenticated user ID instead of provided client_id', [
                    'provided_id' => $validated['client_id'],
                    'authenticated_id' => $clientId
                ]);
            }

            Log::info('Request creation initiated', [
                'product_id' => $validated['product_id'] ?? 'null',
                'plan_type' => $validated['plan_type'] ?? 'null',
                'amount' => $validated['amount'],
                'client_id' => $clientId,
                'lot_id' => $validated['lot_id'] ?? 'null',
                'lot_type' => $validated['lot_type'] ?? 'null'
            ]);

            // Create a purchase request instead of payment
            $purchaseRequest = \App\Models\Request::create([
                'user_id' => $clientId,
                'product_id' => $validated['product_id'] ?? null,
                'service_id' => null, // service_id will be null for now, can be set later
                'payment_plan_id' => $validated['payment_plan_id'] ?? null,
                'lot_id' => $validated['lot_id'] ?? null,
                'lot_type' => $validated['lot_type'] ?? null,
                'deceased_name' => $validated['deceased_name'] ?? null,
                'deceased_date_of_death' => $validated['deceased_date_of_death'] ?? null,
                'deceased_relationship' => $validated['deceased_relationship'] ?? null,
                'additional_deceased_info' => $validated['additional_deceased_info'] ?? null,
                'amount' => $validated['amount'],
                'status' => 'Pending_Approval',
                'status_history' => [
                    [
                        'status' => 'Pending_Approval',
                        'timestamp' => now()->toIso8601String(),
                    ],
                ],
            ]);

            Log::info('Purchase request created', [
                'request_id' => $purchaseRequest->id,
                'user_id' => $clientId,
                'status' => 'Pending_Approval',
            ]);

            // Send notification to admin about pending request
            try {
                $this->emailNotificationService->notifyAdminPendingRequest($purchaseRequest);
                Log::info('Admin notification sent successfully', [
                    'request_id' => $purchaseRequest->id
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to send admin notification', [
                    'request_id' => $purchaseRequest->id,
                    'error' => $e->getMessage()
                ]);
                // Don't fail the request creation if email fails
            }

            return response()->json([
                'message' => 'Your request has been submitted for admin approval',
                'status' => 'pending_approval',
                'request_id' => $purchaseRequest->id,
                'notification' => 'Your request is pending approval. You will be notified once approved.',
                'next_step' => 'Wait for admin approval before proceeding with payment'
            ], 202);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Request creation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to create request',
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

    /**
     * Create payment from approved request
     * POST /api/payments/from-request/{requestId}
     * 
     * @param Request $request
     * @param int $requestId
     * @return \Illuminate\Http\JsonResponse
     */
    public function createFromRequest(Request $request, $requestId)
    {
        try {
            $purchaseRequest = PurchaseRequest::findOrFail($requestId);

            // Verify request is approved
            if ($purchaseRequest->status !== 'Approved') {
                Log::warning('Attempt to create payment from non-approved request', [
                    'request_id' => $requestId,
                    'status' => $purchaseRequest->status,
                    'user_id' => auth()->id(),
                ]);
                return response()->json([
                    'error' => 'Request must be approved before creating payment',
                ], 422);
            }

            // Verify user owns the request
            if ($purchaseRequest->user_id !== auth()->id()) {
                Log::warning('Unauthorized attempt to create payment from request', [
                    'request_id' => $requestId,
                    'request_user_id' => $purchaseRequest->user_id,
                    'auth_user_id' => auth()->id(),
                ]);
                return response()->json([
                    'error' => 'Unauthorized',
                ], 403);
            }

            // Validate required fields for payment
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'payment_method' => 'required|string',
                'description' => 'nullable|string',
            ]);

            // Create payment from request data
            $payment = Payment::create([
                'client_id' => $purchaseRequest->user_id,
                'product_id' => $purchaseRequest->product_id,
                'service_id' => $purchaseRequest->service_id,
                'payment_plan_id' => $purchaseRequest->payment_plan_id,
                'request_id' => $purchaseRequest->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'payment_type' => 'full',
                'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                'status' => 'pending',
                'description' => $validated['description'] ?? 'Payment from approved request',
                'due_date' => now()->addDays(30),
                'customer_name' => $purchaseRequest->user->name ?? 'Guest',
                'service_type' => 'general',
            ]);

            Log::info('Payment created from approved request', [
                'payment_id' => $payment->id,
                'request_id' => $purchaseRequest->id,
                'user_id' => $purchaseRequest->user_id,
                'amount' => $validated['amount'],
            ]);

            return response()->json([
                'message' => 'Payment created successfully',
                'payment' => $payment,
            ], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Request not found for payment creation', [
                'request_id' => $requestId,
            ]);
            return response()->json([
                'error' => 'Request not found',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create payment from request', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to create payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function processPayment(Request $request, $paymentId)
    {
        try {
            Log::info('Process payment request', [
                'payment_id' => $paymentId,
                'all_data' => $request->all(),
            ]);

            $validated = $request->validate([
                'payment_method' => 'required|string',
            ]);

            $payment = Payment::findOrFail($paymentId);

            // Verify the payment belongs to the authenticated user
            if ($payment->client_id !== $request->user()->id) {
                return response()->json([
                    'error' => 'Unauthorized',
                ], 403);
            }

            // Map payment method to valid enum value
            $paymentMethodMap = [
                'card' => 'Card',
                'gcash' => 'GCash',
                'grab_pay' => 'GrabPay',
                'grabpay' => 'GrabPay',
                'paymaya' => 'PayMaya',
                'bank transfer' => 'Bank Transfer',
                'cash' => 'Cash',
                'paymongo' => 'PayMongo',
            ];

            $methodKey = strtolower($validated['payment_method']);
            $paymentMethod = $paymentMethodMap[$methodKey] ?? 'PayMongo';

            Log::info('Payment method mapped', [
                'input' => $validated['payment_method'],
                'mapped' => $paymentMethod,
            ]);

            // Create payment intent with PayMongo
            $amountInCentavos = (int)($payment->amount * 100);

            $response = Http::withBasicAuth($this->paymongoSecretKey, '')
                ->post($this->paymongoBaseUrl . '/payment_intents', [
                    'data' => [
                        'attributes' => [
                            'amount' => $amountInCentavos,
                            'currency' => 'PHP',
                            'description' => $payment->description ?? 'Payment',
                            'statement_descriptor' => 'SANCTUARIO',
                            'payment_method_allowed' => ['card', 'gcash', 'grab_pay', 'paymaya'],
                        ]
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $intentId = $data['data']['id'];
                $clientKey = $data['data']['attributes']['client_key'];

                // Update payment with PayMongo details
                $payment->update([
                    'payment_method' => $paymentMethod,
                    'paymongo_intent_id' => $intentId,
                    'paymongo_client_key' => $clientKey,
                    'transaction_id' => $intentId,
                ]);

                // Create checkout session
                $checkoutResponse = Http::withBasicAuth($this->paymongoSecretKey, '')
                    ->post($this->paymongoBaseUrl . '/checkout_sessions', [
                        'data' => [
                            'attributes' => [
                                'payment_intent_id' => $intentId,
                                'success_url' => config('app.url') . '/api/payments/success?payment_id=' . $paymentId,
                                'cancel_url' => config('app.url') . '/api/payments/cancel',
                                'description' => $payment->description ?? 'Payment',
                                'payment_method_types' => ['card', 'gcash', 'grab_pay', 'paymaya'],
                                'line_items' => [
                                    [
                                        'currency' => 'PHP',
                                        'amount' => (int)($payment->amount * 100),
                                        'description' => $payment->description ?? 'Payment',
                                        'name' => 'Payment',
                                        'quantity' => 1,
                                    ]
                                ]
                            ]
                        ]
                    ]);

                if ($checkoutResponse->successful()) {
                    $checkoutData = $checkoutResponse->json();
                    $checkoutUrl = $checkoutData['data']['attributes']['checkout_url'];

                    Log::info('Checkout session created for existing payment', [
                        'payment_id' => $paymentId,
                        'intent_id' => $intentId,
                        'checkout_url' => $checkoutUrl,
                    ]);

                    return response()->json([
                        'message' => 'Checkout session created',
                        'intent_id' => $intentId,
                        'client_secret' => $clientKey,
                        'checkout_url' => $checkoutUrl,
                        'amount' => $payment->amount,
                        'currency' => 'PHP'
                    ], 201);
                } else {
                    Log::error('PayMongo checkout session error', [
                        'status' => $checkoutResponse->status(),
                        'response' => $checkoutResponse->json()
                    ]);
                    return response()->json([
                        'message' => 'Failed to create checkout session',
                        'error' => $checkoutResponse->json()['errors'][0]['detail'] ?? 'Unknown error'
                    ], 400);
                }
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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Payment not found',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error', [
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to process payment', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to process payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
