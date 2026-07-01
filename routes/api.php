<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\FileController;

// Public file serving route (no auth required)
Route::get('/files/{path}', [FileController::class, 'serve'])->where('path', '.*');

// Test route without any middleware
Route::post('/test', function() {
    return response()->json(['message' => 'API working']);
});

Route::post('/test-request', function(\Illuminate\Http\Request $request) {
    \Illuminate\Support\Facades\Log::info('Test request received', [
        'all_data' => $request->all(),
        'headers' => $request->headers->all()
    ]);
    return response()->json([
        'message' => 'Test request received',
        'data' => $request->all()
    ]);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/client/login', [AuthController::class, 'clientLogin']);
// Register endpoint - requires auth for admin registration, public for client registration
Route::post('/register', [AuthController::class, 'register'])->middleware('auth.optional');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public Client Payment routes (no auth required for customers) - Uses real PayMongo
Route::prefix('payments')->group(function () {
    // Public routes for webhooks and callbacks
    Route::get('/success', [App\Http\Controllers\PaymentController::class, 'paymentSuccess'])->name('payment.success');
    Route::get('/cancel', [App\Http\Controllers\PaymentController::class, 'paymentCancel'])->name('payment.cancel');
    Route::post('/webhook', [App\Http\Controllers\PaymentController::class, 'handleWebhook']);
    Route::get('/methods', [App\Http\Controllers\PaymentController::class, 'getPaymentMethods']);
    
    // Protected routes for authenticated users (clients and admins)
    Route::middleware('auth.multiple')->group(function () {
        Route::get('/', [App\Http\Controllers\PaymentManagementController::class, 'getUserPayments']);
        Route::post('/create-intent', [App\Http\Controllers\PaymentController::class, 'createPaymentIntent']);
        Route::post('/create-checkout', [App\Http\Controllers\PaymentController::class, 'createCheckoutSession']);
        Route::post('/send-receipt', [App\Http\Controllers\PaymentController::class, 'sendReceipt']);
        Route::post('/{paymentId}/process', [App\Http\Controllers\PaymentController::class, 'processPayment']);
    });
    
    // Public endpoint for recording client payments
    Route::post('/record', function(Illuminate\Http\Request $request) {
        try {
            \Illuminate\Support\Facades\Log::info('Payment record request received', $request->all());
            
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

            // SECURITY FIX: This endpoint should only be used by authenticated admins
            // If user is authenticated, verify they are admin or the client_id matches their ID
            if ($request->user()) {
                $authenticatedUserId = $request->user()->id;
                
                // Log if there's a mismatch (potential security issue)
                if ($validated['client_id'] != $authenticatedUserId) {
                    \Illuminate\Support\Facades\Log::warning('Payment record: client_id mismatch', [
                        'authenticated_user_id' => $authenticatedUserId,
                        'provided_client_id' => $validated['client_id'],
                        'ip' => $request->ip()
                    ]);
                    
                    // Only allow if user is admin
                    $user = $request->user();
                    if (!($user instanceof \App\Models\Admin)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Unauthorized: You can only record payments for your own account',
                        ], 403);
                    }
                }
            }

            $validated['payment_reference'] = 'PAY-' . strtoupper(uniqid());

            $payment = \App\Models\Payment::create($validated);
            
            \Illuminate\Support\Facades\Log::info('Payment created successfully', ['id' => $payment->id]);

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'payment' => $payment
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Validation error', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Payment record error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment',
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Public endpoint for listing all payments (for admin without auth)
    Route::get('/all', [App\Http\Controllers\PaymentManagementController::class, 'index']);
    
    // Public checkout endpoint (with optional auth)
    Route::post('/create-checkout-public', [App\Http\Controllers\PaymentController::class, 'createCheckoutSession']);
});

// Public checkout endpoint outside of payments prefix (no auth required)
Route::post('/payments/create-checkout-public', [App\Http\Controllers\PaymentController::class, 'createCheckoutSession']);

Route::middleware('auth.multiple')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/user/grave-plots', [App\Http\Controllers\ReservationController::class, 'getUserGravePlots']);
    Route::get('/user/selected-lots', [App\Http\Controllers\ReservationController::class, 'getUserSelectedLots']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Reservation routes
    Route::prefix('reservations')->group(function () {
        Route::post('/', [App\Http\Controllers\ReservationController::class, 'store']);
        Route::get('/', [App\Http\Controllers\ReservationController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\ReservationController::class, 'show']);
        Route::post('/{id}/cancel', [App\Http\Controllers\ReservationController::class, 'cancel']);
        Route::post('/{id}/pay', [App\Http\Controllers\ReservationController::class, 'pay']);
        Route::post('/{id}/attach-payment-method', [App\Http\Controllers\ReservationController::class, 'attachPaymentMethod']);
        Route::post('/{id}/mark-paid', [App\Http\Controllers\ReservationController::class, 'markPaid']);
    });
    
    // Admin reservation routes
    Route::middleware('access.level:admin')->prefix('admin/reservations')->group(function () {
        Route::get('/', [App\Http\Controllers\ReservationController::class, 'adminIndex']);
        Route::get('/pending', [App\Http\Controllers\ReservationController::class, 'adminPending']);
        Route::post('/{id}/approve', [App\Http\Controllers\ReservationController::class, 'approve']);
        Route::post('/{id}/reject', [App\Http\Controllers\ReservationController::class, 'reject']);
    });
    
    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [App\Http\Controllers\ProfileController::class, 'getProfile']);
        Route::post('/upload-picture', [App\Http\Controllers\ProfileController::class, 'uploadProfilePicture']);
        Route::delete('/delete-picture', [App\Http\Controllers\ProfileController::class, 'deleteProfilePicture']);
        Route::post('/update', [App\Http\Controllers\ProfileController::class, 'updateProfile']);
    });
    
    // Routes accessible by all authenticated admin users (admin, staff, caretaker)
    Route::get('/graves', [AuthController::class, 'getAllGraves']);
    Route::get('/graves/{id}', [AuthController::class, 'getGraveById']);
    Route::get('/clients', [AuthController::class, 'getAllClients']);
    Route::get('/clients/{id}', [AuthController::class, 'getClientById']);
    Route::put('/clients/{id}', [AuthController::class, 'updateClient']);
    Route::patch('/clients/{id}', [AuthController::class, 'updateClient']);
    
    // Routes accessible by admin and staff only
    Route::middleware('access.level:admin,staff')->group(function () {
        Route::get('/users', [AuthController::class, 'getAllUsers']);
    });
    
    // Admin list - accessible by all authenticated users (view only for staff/caretaker)
    Route::get('/admins', [AuthController::class, 'getAllAdmins']);
    
    // Routes accessible by admin only
    Route::middleware('access.level:admin')->group(function () {
        // Permission management routes
        Route::get('/admin-permissions/{adminId}', [App\Http\Controllers\AdminPermissionController::class, 'getAdminPermissions']);
        Route::put('/admin-permissions/{adminId}', [App\Http\Controllers\AdminPermissionController::class, 'updateAdminPermissions']);
    });
    
    // Get current user's permissions
    Route::get('/my-permissions', [App\Http\Controllers\AdminPermissionController::class, 'getMyPermissions']);
    
    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', function (Request $request) {
            $notifications = \App\Models\Notification::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json(['notifications' => $notifications]);
        });
        Route::get('/unread-count', function (Request $request) {
            $count = \App\Models\Notification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->count();
            return response()->json(['count' => $count]);
        });
        Route::post('/{id}/mark-read', function (Request $request, $id) {
            $notification = \App\Models\Notification::where('user_id', $request->user()->id)
                ->findOrFail($id);
            $notification->markAsRead();
            return response()->json(['message' => 'Notification marked as read']);
        });
        Route::post('/mark-all-read', function (Request $request) {
            \App\Models\Notification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);
            return response()->json(['message' => 'All notifications marked as read']);
        });
    });
    
    // Admin notification routes
    Route::prefix('admin/notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\NotificationController::class, 'getAdminNotifications']);
        Route::post('/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    });
    
    // SMS routes (CORS is already applied globally via middleware)
    Route::prefix('sms')->middleware('auth:sanctum')->group(function () {
        Route::post('/send', [App\Http\Controllers\SmsController::class, 'sendSms']);
        Route::post('/send-bulk', [App\Http\Controllers\SmsController::class, 'sendBulkSms']);
        Route::post('/send-payment-reminders', [App\Http\Controllers\SmsController::class, 'sendPaymentReminders']);
        Route::post('/send-booking-confirmation', [App\Http\Controllers\SmsController::class, 'sendBookingConfirmation']);
        Route::get('/logs', [App\Http\Controllers\SmsController::class, 'getSmsLogs']);
        Route::get('/balance', [App\Http\Controllers\SmsController::class, 'getBalance']);
        Route::get('/clients', [App\Http\Controllers\SmsController::class, 'getClients']);
    });
    
    // Maintenance Request routes
    Route::prefix('maintenance-requests')->group(function () {
        Route::get('/', [App\Http\Controllers\MaintenanceRequestController::class, 'index']);
        Route::post('/', [App\Http\Controllers\MaintenanceRequestController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\MaintenanceRequestController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\MaintenanceRequestController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\MaintenanceRequestController::class, 'destroy']);
        
        // Approval/Rejection routes
        Route::post('/{id}/approve', [App\Http\Controllers\MaintenanceRequestController::class, 'approve']);
        Route::post('/{id}/reject', [App\Http\Controllers\MaintenanceRequestController::class, 'reject']);
        
        // Progress tracking routes (available immediately after approval)
        Route::post('/{id}/progress', [App\Http\Controllers\MaintenanceRequestController::class, 'updateProgress']);
        Route::get('/{id}/progress-history', [App\Http\Controllers\MaintenanceRequestController::class, 'getProgressHistory']);
    });
    
    // Service routes
    Route::prefix('services')->group(function () {
        Route::get('/', [App\Http\Controllers\ServiceController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\ServiceController::class, 'show']);
        Route::post('/', [App\Http\Controllers\ServiceController::class, 'store']);
        Route::post('/{id}', [App\Http\Controllers\ServiceController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\ServiceController::class, 'destroy']);
    });
    
    // Property routes
    Route::prefix('properties')->group(function () {
        Route::get('/', [App\Http\Controllers\PropertyServiceController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\PropertyServiceController::class, 'show']);
        Route::post('/', [App\Http\Controllers\PropertyServiceController::class, 'store']);
        Route::post('/{id}', [App\Http\Controllers\PropertyServiceController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\PropertyServiceController::class, 'destroy']);
    });
    
    // Payment Management routes - protected by billing permission
    Route::prefix('payments')->middleware('billing.permission')->group(function () {
        Route::get('/', [App\Http\Controllers\PaymentManagementController::class, 'index']);
        Route::post('/', [App\Http\Controllers\PaymentManagementController::class, 'store']);
        Route::put('/{id}/status', [App\Http\Controllers\PaymentManagementController::class, 'updateStatus']);
        Route::get('/analytics', [App\Http\Controllers\PaymentManagementController::class, 'analytics']);
        Route::post('/check-overdue', [App\Http\Controllers\PaymentManagementController::class, 'checkOverduePayments']);
        Route::post('/send-reminders', [App\Http\Controllers\PaymentManagementController::class, 'sendPaymentReminders']);
        Route::post('/{id}/generate-receipt', [App\Http\Controllers\PaymentManagementController::class, 'generateReceipt']);
        Route::get('/{id}/download-receipt', [App\Http\Controllers\PaymentManagementController::class, 'downloadReceipt']);
        
        // Admin dashboard routes
        Route::get('/admin/all', [App\Http\Controllers\PaymentManagementController::class, 'adminAllPayments']);
        Route::get('/admin/stats', [App\Http\Controllers\PaymentManagementController::class, 'adminPaymentStats']);
    });
    
    // Payment Plan routes - protected by billing permission
    Route::prefix('payment-plans')->middleware('billing.permission')->group(function () {
        Route::get('/', [App\Http\Controllers\PaymentPlanController::class, 'index']);
        Route::post('/', [App\Http\Controllers\PaymentPlanController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\PaymentPlanController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\PaymentPlanController::class, 'update']);
        Route::post('/{id}/process-installment', [App\Http\Controllers\PaymentPlanController::class, 'processInstallment']);
        Route::post('/{id}/cancel', [App\Http\Controllers\PaymentPlanController::class, 'cancel']);
    });
    
    // Requirement routes
    Route::prefix('requirements')->group(function () {
        // User routes (no permission check needed for clients)
        Route::get('/service/{service}', [App\Http\Controllers\RequirementController::class, 'getServiceRequirements']);
        Route::post('/booking/{booking}/submit', [App\Http\Controllers\RequirementController::class, 'submitRequirements']);
        
        // View routes (accessible to all authenticated users)
        Route::get('/', [App\Http\Controllers\RequirementController::class, 'getAllRequirements']);
        Route::get('/booking/{booking}/submissions', [App\Http\Controllers\RequirementController::class, 'getBookingSubmissions']);
        
        // Admin action routes - protected by requirements permission
        Route::middleware('requirements.permission')->group(function () {
            Route::post('/', [App\Http\Controllers\RequirementController::class, 'createRequirement']);
            Route::put('/{requirement}', [App\Http\Controllers\RequirementController::class, 'updateRequirement']);
            Route::delete('/{requirement}', [App\Http\Controllers\RequirementController::class, 'deleteRequirement']);
            Route::post('/service/{service}/assign', [App\Http\Controllers\RequirementController::class, 'assignRequirements']);
            Route::post('/submission/{submission}/review', [App\Http\Controllers\RequirementController::class, 'reviewSubmission']);
        });
    });
    
    // Booking authorization routes (admin only)
    Route::middleware('auth.multiple')->prefix('bookings/authorization')->group(function () {
        Route::get('/pending', [App\Http\Controllers\BookingAuthorizationController::class, 'getPendingRequests']);
        Route::get('/stats', [App\Http\Controllers\BookingAuthorizationController::class, 'getStats']);
        Route::post('/{bookingId}/approve', [App\Http\Controllers\BookingAuthorizationController::class, 'approveRequest']);
        Route::post('/{bookingId}/reject', [App\Http\Controllers\BookingAuthorizationController::class, 'rejectRequest']);
    });

    // Booking routes
    Route::prefix('bookings')->group(function () {
        // Client routes
        Route::post('/create', [App\Http\Controllers\BookingController::class, 'create']);
        Route::get('/user/{userId}', [App\Http\Controllers\BookingController::class, 'getUserBookings']);
        Route::get('/{booking}', [App\Http\Controllers\BookingController::class, 'show']);
        Route::post('/{booking}/submit-requirements', [App\Http\Controllers\BookingController::class, 'submitRequirements']);
        Route::post('/{booking}/pay', [App\Http\Controllers\BookingController::class, 'pay']);
        Route::get('/{bookingId}/payment', [App\Http\Controllers\BookingController::class, 'getOrCreatePayment']);
        
        // Admin routes
        Route::get('/', [App\Http\Controllers\BookingController::class, 'adminIndex']);
        Route::post('/{booking}/update-status', [App\Http\Controllers\BookingController::class, 'updateStatus']);
        Route::post('/{booking}/review-requirements', [App\Http\Controllers\BookingController::class, 'reviewRequirements']);
        Route::post('/{booking}/update-completion', [App\Http\Controllers\BookingController::class, 'updateServiceCompletion']);
        Route::post('/{booking}/progress', [App\Http\Controllers\BookingController::class, 'updateProgress']);
        
        // Admin dashboard routes
        Route::get('/admin/all', [App\Http\Controllers\BookingController::class, 'adminAllBookings']);
        Route::get('/admin/stats', [App\Http\Controllers\BookingController::class, 'adminBookingStats']);
    });
    
    // Request management routes
    Route::prefix('requests')->group(function () {
        // Admin routes (must be defined before /{request} to avoid conflicts)
        Route::middleware('access.level:admin,staff,caretaker')->group(function () {
            Route::get('/admin/pending', [App\Http\Controllers\RequestController::class, 'adminIndex']);
        });
        
        // User routes
        Route::post('/', [App\Http\Controllers\RequestController::class, 'store']);
        Route::get('/', [App\Http\Controllers\RequestController::class, 'index']);
        Route::get('/{request}', [App\Http\Controllers\RequestController::class, 'show']);
        Route::post('/{request}/cancel', [App\Http\Controllers\RequestController::class, 'cancel']);
        
        // Admin action routes
        Route::middleware('access.level:admin')->group(function () {
            Route::post('/{request}/approve', [App\Http\Controllers\RequestController::class, 'approve']);
            Route::post('/{request}/reject', [App\Http\Controllers\RequestController::class, 'reject']);
        });
    });
    
    // Payment from request route
    Route::post('/payments/from-request/{requestId}', [App\Http\Controllers\PaymentController::class, 'createFromRequest']);
});

// Lot selection routes (public - no auth required) - Using consolidated PropertyController
Route::prefix('lawn-lots')->group(function () {
    Route::get('/', function () {
        return app(App\Http\Controllers\PropertyController::class)->getProperties(request(), 'lawn-lots');
    });
    Route::get('/{lotId}', function ($lotId) {
        return app(App\Http\Controllers\PropertyController::class)->getPropertyDetails('lawn-lots', $lotId);
    });
    Route::post('/select', function () {
        return app(App\Http\Controllers\PropertyController::class)->selectProperty(request(), 'lawn-lots');
    });
});

Route::prefix('columbariums')->group(function () {
    Route::get('/', function () {
        return app(App\Http\Controllers\PropertyController::class)->getProperties(request(), 'columbariums');
    });
    Route::get('/{columbariumId}', function ($columbariumId) {
        return app(App\Http\Controllers\PropertyController::class)->getPropertyDetails('columbariums', $columbariumId);
    });
    Route::post('/select', function () {
        return app(App\Http\Controllers\PropertyController::class)->selectProperty(request(), 'columbariums');
    });
});

Route::prefix('family-estates')->group(function () {
    Route::get('/', function () {
        return app(App\Http\Controllers\PropertyController::class)->getProperties(request(), 'family-estates');
    });
    Route::get('/{estateId}', function ($estateId) {
        return app(App\Http\Controllers\PropertyController::class)->getPropertyDetails('family-estates', $estateId);
    });
    Route::post('/select', function () {
        return app(App\Http\Controllers\PropertyController::class)->selectProperty(request(), 'family-estates');
    });
});

// Public service routes (for client-side)
Route::get('/public/services', [App\Http\Controllers\ServiceController::class, 'publicIndex']);

// Public properties route (for client-side)
Route::get('/public/properties', [App\Http\Controllers\PropertyServiceController::class, 'publicIndex']);

// Public payment methods route (for testing)
Route::get('/public/payment-methods', function() {
    return response()->json([
        'payment_methods' => [
            ['type' => 'card', 'name' => 'Credit/Debit Card', 'description' => 'Visa, Mastercard, etc.', 'enabled' => true],
            ['type' => 'gcash', 'name' => 'GCash', 'description' => 'Mobile wallet payment', 'enabled' => true],
            ['type' => 'grab_pay', 'name' => 'GrabPay', 'description' => 'Grab wallet payment', 'enabled' => true],
            ['type' => 'paymaya', 'name' => 'PayMaya', 'description' => 'PayMaya wallet', 'enabled' => true],
        ],
        'count' => 4
    ]);
});

// Public requirements route (for signup page)
Route::get('/public/requirements', [App\Http\Controllers\RequirementController::class, 'getAllRequirements']);

// Public inquiry routes (for client-side)
Route::post('/inquiries/submit', [App\Http\Controllers\InquiryController::class, 'submit']);

// User inquiry routes (protected)
Route::middleware('auth.multiple')->prefix('inquiries')->group(function () {
    Route::get('/user', [App\Http\Controllers\InquiryController::class, 'getUserInquiries']);
    Route::post('/{id}/mark-paid', [App\Http\Controllers\InquiryController::class, 'markAsPaid']);
    Route::post('/{id}/create-payment', [App\Http\Controllers\InquiryController::class, 'createPayment']);
});

// Admin inquiry routes (protected)
Route::middleware('auth.multiple')->prefix('admin/inquiries')->group(function () {
    Route::get('/', [App\Http\Controllers\InquiryController::class, 'index']);
    Route::put('/{id}/status', [App\Http\Controllers\InquiryController::class, 'updateStatus']);
    Route::post('/{id}/photos', [App\Http\Controllers\InquiryController::class, 'uploadPhotos']);
    Route::delete('/{id}', [App\Http\Controllers\InquiryController::class, 'destroy']);
});

// Admin activity logs routes (protected)
Route::middleware('auth.multiple')->prefix('admin/activity-logs')->group(function () {
    Route::get('/', [App\Http\Controllers\ActivityLogController::class, 'index']);
    Route::get('/stats', [App\Http\Controllers\ActivityLogController::class, 'getStats']);
    Route::get('/actions', [App\Http\Controllers\ActivityLogController::class, 'getActions']);
    Route::get('/export/csv', [App\Http\Controllers\ActivityLogController::class, 'exportCsv']);
    Route::get('/{id}', [App\Http\Controllers\ActivityLogController::class, 'show']);
});

// Public contact message routes (for client-side)
Route::post('/contact/submit', [ContactMessageController::class, 'submit']);

// Public site settings routes (for client-side)
Route::get('/site-settings', [App\Http\Controllers\SiteSettingController::class, 'getPublicSettings']);

// Admin contact message routes (protected)
Route::middleware('auth.multiple')->prefix('admin/contact-messages')->group(function () {
    Route::get('/', [ContactMessageController::class, 'index']);
    Route::put('/{id}/status', [ContactMessageController::class, 'updateStatus']);
    Route::delete('/{id}', [ContactMessageController::class, 'destroy']);
});

// Admin site settings routes (protected)
Route::middleware('auth.multiple')->prefix('admin/site-settings')->group(function () {
    Route::get('/', [App\Http\Controllers\SiteSettingController::class, 'index']);
    Route::post('/update', [App\Http\Controllers\SiteSettingController::class, 'updateSettings']);
    Route::post('/upload-image', [App\Http\Controllers\SiteSettingController::class, 'uploadImage']);
    Route::post('/initialize-defaults', [App\Http\Controllers\SiteSettingController::class, 'initializeDefaults']);
});

// Debug endpoint to check user's bookings and payments
Route::middleware('auth.multiple')->get('/debug/user-data', function (Request $request) {
    $user = $request->user();
    $bookings = \App\Models\Booking::where('user_id', $user->id)->get();
    $payments = \App\Models\Payment::where('client_id', $user->id)->get();
    
    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ],
        'bookings_count' => $bookings->count(),
        'bookings' => $bookings,
        'payments_count' => $payments->count(),
        'payments' => $payments,
    ]);
});

// Debug endpoint to check if token is being sent
Route::get('/debug/token-check', function (Request $request) {
    $authHeader = $request->header('Authorization');
    $token = $request->bearerToken();
    
    return response()->json([
        'auth_header' => $authHeader ? 'present' : 'missing',
        'bearer_token' => $token ? 'present' : 'missing',
        'origin' => $request->header('Origin'),
    ]);
});