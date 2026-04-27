<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Notification;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ReservationController extends Controller
{
    /**
     * Create a new reservation
     * POST /api/reservations
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'nullable|integer|exists:products,id',
                'service_id' => 'nullable|integer|exists:services,id',
                'lot_id' => 'nullable|integer',
                'lot_type' => 'nullable|string|in:lawn-lots,columbariums,family-estates,LawnLot,Columbarium,FamilyEstate',
                'request_purpose' => 'nullable|string|in:deceased,reservation',
                'id_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
                'deceased_name' => 'nullable|string|max:255',
                'deceased_date_of_death' => 'nullable|date|before_or_equal:today',
                'deceased_relationship' => 'nullable|string|max:100',
                'plan_type' => 'nullable|string|in:Monthly,Quarterly,Yearly',
                'amount' => 'required|numeric|min:0',
            ]);

            // Get authenticated user
            $userId = $request->user()->id ?? $request->input('user_id');
            
            if (!$userId) {
                return response()->json([
                    'message' => 'User not authenticated',
                ], 401);
            }

            // Handle file upload
            $idFilePath = null;
            if ($request->hasFile('id_file')) {
                $file = $request->file('id_file');
                $fileName = 'id_' . $userId . '_' . time() . '.' . $file->getClientOriginalExtension();
                $idFilePath = $file->storeAs('id_uploads', $fileName, 'public');
                \Log::info('ID file uploaded', ['path' => $idFilePath, 'user_id' => $userId]);
            }

            // Clean up null values from FormData
            $reservationData = [
                'user_id' => $userId,
                'product_id' => $validated['product_id'] ?? null,
                'service_id' => $validated['service_id'] ?? null,
                'lot_id' => $validated['lot_id'] ?? null,
                'lot_type' => $validated['lot_type'] ?? null,
                'request_purpose' => $validated['request_purpose'] ?? null, // Don't default to 'deceased' - let it be null for services
                'id_file' => $idFilePath,
                'deceased_name' => $validated['deceased_name'] ?? null,
                'deceased_date_of_death' => $validated['deceased_date_of_death'] ?? null,
                'deceased_relationship' => $validated['deceased_relationship'] ?? null,
                'plan_type' => $validated['plan_type'] ?? null,
                'amount' => $validated['amount'],
                'status' => 'pending',
            ];

            // Remove null values from FormData (they come as string 'null')
            foreach ($reservationData as $key => $value) {
                if ($value === 'null' || $value === null) {
                    $reservationData[$key] = null;
                }
            }

            // Create reservation (works for both products and services)
            $reservation = Reservation::create($reservationData);

            Log::info('Reservation created', [
                'reservation_id' => $reservation->id,
                'user_id' => $userId,
                'product_id' => $validated['product_id'] ?? null,
                'service_id' => $validated['service_id'] ?? null,
                'request_purpose' => $validated['request_purpose'] ?? null,
                'id_file' => $idFilePath,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Reservation created successfully',
                'reservation' => $reservation,
                'status' => 'pending',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Reservation creation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to create reservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's reservations
     * GET /api/reservations
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            $reservations = Reservation::where('user_id', $userId)
                ->with(['product', 'service', 'lot', 'approvedBy'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'reservations' => $reservations,
                'count' => $reservations->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching reservations', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch reservations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get reservation details
     * GET /api/reservations/{id}
     */
    public function show(Request $request, $id)
    {
        try {
            $reservation = Reservation::with(['user', 'product', 'service', 'lot', 'approvedBy'])
                ->findOrFail($id);

            // Check if user owns this reservation or is admin
            if ($reservation->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 403);
            }

            return response()->json([
                'reservation' => $reservation,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching reservation', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Reservation not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Admin: Get all pending reservations
     * GET /api/admin/reservations/pending
     */
    public function adminPending(Request $request)
    {
        try {
            $reservations = Reservation::pending()
                ->with(['user', 'product', 'service', 'lot'])
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'reservations' => $reservations,
                'count' => $reservations->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching pending reservations', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch reservations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Get all reservations
     * GET /api/admin/reservations
     */
    public function adminIndex(Request $request)
    {
        try {
            $status = $request->query('status');
            
            $query = Reservation::with(['user', 'product', 'service', 'lot', 'approvedBy']);
            
            if ($status) {
                $query->where('status', $status);
            }
            
            $reservations = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'reservations' => $reservations,
                'count' => $reservations->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching admin reservations', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch reservations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Approve reservation
     * POST /api/admin/reservations/{id}/approve
     */
    public function approve(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'notes' => 'nullable|string|max:1000',
            ]);

            $reservation = Reservation::findOrFail($id);

            if ($reservation->status !== 'pending') {
                return response()->json([
                    'message' => 'Only pending reservations can be approved',
                ], 422);
            }

            $reservation->approve($request->user()->id, $validated['notes'] ?? null);

            // Create a payment record for the approved reservation
            $payment = \App\Models\Payment::create([
                'client_id' => $reservation->user_id,
                'reservation_id' => $reservation->id,
                'reservation_code' => $reservation->reservation_code,
                'invoice_number' => $reservation->invoice_number,
                'product_id' => $reservation->product_id,
                'service_id' => $reservation->service_id,
                'amount' => $reservation->amount,
                'payment_method' => 'PayMongo',
                'payment_type' => 'full',
                'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                'status' => 'pending',
                'description' => 'Reservation Payment - ' . ($reservation->product?->title || $reservation->service?->title || 'Reservation'),
                'due_date' => now()->addDays(30),
                'customer_name' => $reservation->deceased_name ?? 'Guest',
                'service_type' => 'reservation',
            ]);

            // Log activity
            ActivityLog::log(
                'reservation_approved',
                'Reservation',
                $reservation->id,
                'Reservation #' . $reservation->id . ' approved for ' . $reservation->deceased_name . ' (Amount: ₱' . $reservation->amount . ')',
                ['notes' => $validated['notes'] ?? null],
                $request
            );

            // Send notification to user
            Notification::create([
                'user_id' => $reservation->user_id,
                'type' => 'reservation_approved',
                'title' => 'Reservation Approved',
                'message' => 'Your reservation for ' . ($reservation->product?->title || $reservation->service?->title || 'a product/service') . ' has been approved. You can now proceed to payment.',
                'data' => [
                    'reservation_id' => $reservation->id,
                    'amount' => $reservation->amount,
                ],
            ]);

            Log::info('Reservation approved and payment created', [
                'reservation_id' => $id,
                'payment_id' => $payment->id,
                'admin_id' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Reservation approved successfully',
                'reservation' => $reservation,
            ]);
        } catch (\Exception $e) {
            Log::error('Error approving reservation', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to approve reservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Admin: Reject reservation
     * POST /api/admin/reservations/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'notes' => 'required|string|max:1000',
            ]);

            $reservation = Reservation::findOrFail($id);

            if ($reservation->status !== 'pending') {
                return response()->json([
                    'message' => 'Only pending reservations can be rejected',
                ], 422);
            }

            $reservation->reject($request->user()->id, $validated['notes']);

            // Log activity
            ActivityLog::log(
                'reservation_rejected',
                'Reservation',
                $reservation->id,
                'Reservation #' . $reservation->id . ' rejected for ' . $reservation->deceased_name . '. Reason: ' . $validated['notes'],
                ['notes' => $validated['notes']],
                $request
            );

            // Send notification to user
            Notification::create([
                'user_id' => $reservation->user_id,
                'type' => 'reservation_rejected',
                'title' => 'Reservation Rejected',
                'message' => 'Your reservation for ' . ($reservation->product?->title || $reservation->service?->title || 'a product/service') . ' has been rejected. Reason: ' . $validated['notes'],
                'data' => [
                    'reservation_id' => $reservation->id,
                ],
            ]);

            Log::info('Reservation rejected', [
                'reservation_id' => $id,
                'admin_id' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Reservation rejected successfully',
                'reservation' => $reservation,
            ]);
        } catch (\Exception $e) {
            Log::error('Error rejecting reservation', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to reject reservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * User: Cancel reservation
     * POST /api/reservations/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);

            // Check if user owns this reservation
            if ($reservation->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 403);
            }

            if ($reservation->status !== 'pending') {
                return response()->json([
                    'message' => 'Only pending reservations can be cancelled',
                ], 422);
            }

            $reservation->cancel();

            Log::info('Reservation cancelled', [
                'reservation_id' => $id,
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Reservation cancelled successfully',
                'reservation' => $reservation,
            ]);
        } catch (\Exception $e) {
            Log::error('Error cancelling reservation', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to cancel reservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * User: Convert approved reservation to payment
     * POST /api/reservations/{id}/pay
     */
    public function pay(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'payment_method' => 'required|string|in:card,gcash,grab_pay,paymaya,dob',
            ]);

            $reservation = Reservation::findOrFail($id);

            // Check if user owns this reservation
            if ($reservation->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 403);
            }

            if ($reservation->status !== 'approved') {
                return response()->json([
                    'message' => 'Only approved reservations can be paid',
                ], 422);
            }

            // Create a payment intent with PayMongo instead of marking as completed
            $environment = config('services.paymongo.environment', 'test');
            
            if ($environment === 'test') {
                $paymongoSecretKey = config('services.paymongo.test_secret_key') ?? env('PAYMONGO_TEST_SECRET_KEY');
            } else {
                $paymongoSecretKey = config('services.paymongo.secret_key') ?? env('PAYMONGO_SECRET_KEY');
            }
            
            $paymongoBaseUrl = 'https://api.paymongo.com/v1';

            // Convert amount to centavos (PayMongo uses centavos)
            $amountInCentavos = (int)($reservation->amount * 100);

            // Map payment method to PayMongo allowed methods
            $paymentMethodMap = [
                'card' => 'card',
                'gcash' => 'gcash',
                'grab_pay' => 'grab_pay',
                'paymaya' => 'paymaya',
                'dob' => 'dob',
            ];
            
            $paymentMethodAllowed = [$paymentMethodMap[$validated['payment_method']] ?? 'card'];

            $response = Http::withBasicAuth($paymongoSecretKey, '')
                ->post($paymongoBaseUrl . '/payment_intents', [
                    'data' => [
                        'attributes' => [
                            'amount' => $amountInCentavos,
                            'currency' => 'PHP',
                            'description' => 'Reservation Payment - ' . ($reservation->product?->title || $reservation->service?->title || 'Product/Service'),
                            'statement_descriptor' => 'SANCTUARIO',
                            'payment_method_allowed' => $paymentMethodAllowed,
                        ]
                    ]
                ]);

            Log::info('PayMongo payment intent response', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            if (!$response->successful()) {
                Log::error('PayMongo payment intent error', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                return response()->json([
                    'message' => 'Failed to create payment intent',
                    'error' => $response->json()['errors'][0]['detail'] ?? 'Unknown error'
                ], 400);
            }

            $paymongoData = $response->json();
            $intentId = $paymongoData['data']['id'];
            $clientKey = $paymongoData['data']['attributes']['client_key'];

            // Create payment record with pending status
            $payment = \App\Models\Payment::create([
                'client_id' => $request->user()->id,
                'reservation_id' => $reservation->id,
                'reservation_code' => $reservation->reservation_code,
                'product_id' => $reservation->product_id,
                'service_id' => $reservation->service_id,
                'amount' => $reservation->amount,
                'payment_method' => $validated['payment_method'],
                'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                'payment_type' => 'full',
                'status' => 'pending',
                'transaction_id' => $intentId,
                'due_date' => now()->addDays(30),
                'paymongo_intent_id' => $intentId,
                'paymongo_client_key' => $clientKey,
            ]);

            // DO NOT mark reservation as paid yet - wait for payment to be completed
            // $reservation->update(['status' => 'paid']);

            Log::info('Reservation payment intent created', [
                'reservation_id' => $id,
                'payment_id' => $payment->id,
                'intent_id' => $intentId,
            ]);

            return response()->json([
                'message' => 'Payment intent created successfully',
                'payment' => $payment,
                'reservation' => $reservation,
                'intent_id' => $intentId,
                'client_key' => $clientKey,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error processing reservation payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to process payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Attach payment method to payment intent and complete payment
     * POST /api/reservations/{id}/attach-payment-method
     */
    public function attachPaymentMethod(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'payment_method_type' => 'required|string|in:card,gcash,grab_pay,paymaya,dob',
                'intent_id' => 'required|string',
                'client_key' => 'required|string',
            ]);

            $reservation = Reservation::findOrFail($id);

            // Check if user owns this reservation
            if ($reservation->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], 403);
            }

            $environment = config('services.paymongo.environment', 'test');
            
            if ($environment === 'test') {
                $paymongoSecretKey = config('services.paymongo.test_secret_key') ?? env('PAYMONGO_TEST_SECRET_KEY');
            } else {
                $paymongoSecretKey = config('services.paymongo.secret_key') ?? env('PAYMONGO_SECRET_KEY');
            }
            
            $paymongoBaseUrl = 'https://api.paymongo.com/v1';

            // For test mode, we'll simulate payment completion
            // In production, you would use PayMongo's hosted checkout or mobile SDK
            if ($environment === 'test') {
                // In test mode, automatically mark as paid after a short delay
                // This simulates the user completing the payment
                
                // Update payment record with completed status
                $payment = \App\Models\Payment::where('reservation_id', $reservation->id)
                    ->where('paymongo_intent_id', $validated['intent_id'])
                    ->first();

                if ($payment) {
                    $payment->update([
                        'status' => 'completed',
                        'paid_date' => now(),
                        'completed_at' => now(),
                    ]);
                }

                // Mark reservation as paid
                $reservation->update(['status' => 'paid']);

                // Log activity
                ActivityLog::log(
                    'payment_processed',
                    'Payment',
                    $payment->id ?? null,
                    'Payment processed for Reservation #' . $reservation->id . ' (Deceased: ' . $reservation->deceased_name . ', Amount: ₱' . $reservation->amount . ', Method: ' . $validated['payment_method_type'] . ')',
                    ['payment_method' => $validated['payment_method_type'], 'amount' => $reservation->amount],
                    $request
                );

                Log::info('Reservation payment completed (test mode)', [
                    'reservation_id' => $id,
                    'payment_id' => $payment->id ?? null,
                    'intent_id' => $validated['intent_id'],
                ]);

                return response()->json([
                    'message' => 'Payment processed successfully (test mode)',
                    'payment' => $payment,
                    'reservation' => $reservation,
                    'payment_status' => 'completed',
                ], 200);
            }

            // For production, create payment method and attach to intent
            // Create payment method based on type
            $paymentMethodData = [
                'data' => [
                    'attributes' => [
                        'type' => $validated['payment_method_type'],
                    ]
                ]
            ];

            // Create payment method
            $paymentMethodResponse = Http::withBasicAuth($paymongoSecretKey, '')
                ->post($paymongoBaseUrl . '/payment_methods', $paymentMethodData);

            Log::info('PayMongo create payment method response', [
                'status' => $paymentMethodResponse->status(),
                'response' => $paymentMethodResponse->json()
            ]);

            if (!$paymentMethodResponse->successful()) {
                Log::error('PayMongo create payment method error', [
                    'status' => $paymentMethodResponse->status(),
                    'response' => $paymentMethodResponse->json()
                ]);
                return response()->json([
                    'message' => 'Failed to create payment method',
                    'error' => $paymentMethodResponse->json()['errors'][0]['detail'] ?? 'Unknown error'
                ], 400);
            }

            $paymentMethodData = $paymentMethodResponse->json();
            $paymentMethodId = $paymentMethodData['data']['id'];

            // Attach payment method to payment intent
            $attachResponse = Http::withBasicAuth($paymongoSecretKey, '')
                ->post($paymongoBaseUrl . '/payment_intents/' . $validated['intent_id'] . '/attach', [
                    'data' => [
                        'attributes' => [
                            'payment_method' => $paymentMethodId,
                            'client_key' => $validated['client_key'],
                            'return_url' => config('app.url') . '/my-maintenance-requests',
                        ]
                    ]
                ]);

            Log::info('PayMongo attach payment method response', [
                'status' => $attachResponse->status(),
                'response' => $attachResponse->json()
            ]);

            if (!$attachResponse->successful()) {
                Log::error('PayMongo attach payment method error', [
                    'status' => $attachResponse->status(),
                    'response' => $attachResponse->json()
                ]);
                return response()->json([
                    'message' => 'Failed to attach payment method',
                    'error' => $attachResponse->json()['errors'][0]['detail'] ?? 'Unknown error'
                ], 400);
            }

            $paymongoData = $attachResponse->json();
            $paymentStatus = $paymongoData['data']['attributes']['status'] ?? 'unknown';

            // Update payment record with completed status
            $payment = \App\Models\Payment::where('reservation_id', $reservation->id)
                ->where('paymongo_intent_id', $validated['intent_id'])
                ->first();

            if ($payment) {
                $payment->update([
                    'status' => 'completed',
                    'paid_date' => now(),
                    'completed_at' => now(),
                ]);
            }

            // Mark reservation as paid
            $reservation->update(['status' => 'paid']);

            // Log activity
            ActivityLog::log(
                'payment_processed',
                'Payment',
                $payment->id ?? null,
                'Payment processed for Reservation #' . $reservation->id . ' (Deceased: ' . $reservation->deceased_name . ', Amount: ₱' . $reservation->amount . ', Method: ' . $validated['payment_method_type'] . ')',
                ['payment_method' => $validated['payment_method_type'], 'amount' => $reservation->amount, 'payment_status' => $paymentStatus],
                $request
            );

            Log::info('Reservation payment completed', [
                'reservation_id' => $id,
                'payment_id' => $payment->id ?? null,
                'intent_id' => $validated['intent_id'],
                'payment_status' => $paymentStatus,
            ]);

            return response()->json([
                'message' => 'Payment processed successfully',
                'payment' => $payment,
                'reservation' => $reservation,
                'payment_status' => $paymentStatus,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error attaching payment method', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to process payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's grave plots (lawn lots, columbariums, family estates)
     * GET /api/user/grave-plots
     */
    public function getUserGravePlots(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            // Get all approved/paid reservations for this user
            $gravePlots = Reservation::where('user_id', $userId)
                ->whereIn('status', ['approved', 'paid'])
                ->where(function ($query) {
                    $query->whereNotNull('lot_id')
                          ->orWhereNotNull('lot_type');
                })
                ->with(['lot'])
                ->get();

            return response()->json([
                'grave_plots' => $gravePlots,
                'count' => $gravePlots->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user grave plots', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch grave plots',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's previously selected lots (to prevent duplicate selections)
     * GET /api/user/selected-lots
     */
    public function getUserSelectedLots(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            // Get all reservations for this user (regardless of status)
            // to prevent them from selecting the same lot again
            $selectedLots = Reservation::where('user_id', $userId)
                ->whereNotNull('lot_id')
                ->select('lot_id', 'lot_type', 'status', 'created_at')
                ->get()
                ->map(function ($reservation) {
                    return [
                        'id' => $reservation->lot_id,
                        'lot_type' => $reservation->lot_type,
                        'status' => $reservation->status,
                        'created_at' => $reservation->created_at,
                    ];
                });

            return response()->json([
                'selected_lots' => $selectedLots,
                'count' => $selectedLots->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user selected lots', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch selected lots',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

