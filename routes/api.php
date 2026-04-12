<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactMessageController;

// Test route without any middleware
Route::post('/test', function() {
    return response()->json(['message' => 'API working']);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/client/login', [AuthController::class, 'clientLogin']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Public Client Payment routes (no auth required for customers) - Uses real PayMongo
Route::prefix('payments')->group(function () {
    // Public routes for webhooks and callbacks
    Route::get('/success', [App\Http\Controllers\PaymentController::class, 'paymentSuccess']);
    Route::get('/cancel', [App\Http\Controllers\PaymentController::class, 'paymentCancel']);
    Route::post('/webhook', [App\Http\Controllers\PaymentController::class, 'handleWebhook']);
    
    // Protected routes for authenticated users (clients and admins)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/methods', [App\Http\Controllers\PaymentController::class, 'getPaymentMethods']);
        Route::post('/create-intent', [App\Http\Controllers\PaymentController::class, 'createPaymentIntent']);
        Route::post('/create-checkout', [App\Http\Controllers\PaymentController::class, 'createCheckoutSession']);
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
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [App\Http\Controllers\ProfileController::class, 'getProfile']);
        Route::post('/upload-picture', [App\Http\Controllers\ProfileController::class, 'uploadProfilePicture']);
        Route::delete('/delete-picture', [App\Http\Controllers\ProfileController::class, 'deleteProfilePicture']);
    });
    
    // Routes accessible by all authenticated admin users (admin, staff, caretaker)
    Route::get('/graves', [AuthController::class, 'getAllGraves']);
    Route::get('/graves/{id}', [AuthController::class, 'getGraveById']);
    Route::get('/clients', [AuthController::class, 'getAllClients']);
    Route::get('/clients/{id}', [AuthController::class, 'getClientById']);
    
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
    
    // SMS routes
    Route::prefix('sms')->group(function () {
        Route::post('/send', [App\Http\Controllers\SmsController::class, 'sendSms']);
        Route::post('/send-bulk', [App\Http\Controllers\SmsController::class, 'sendBulkSms']);
        Route::get('/clients', [App\Http\Controllers\SmsController::class, 'getClients']);
    });
    
    // Maintenance Request routes
    Route::prefix('maintenance-requests')->group(function () {
        Route::get('/', [App\Http\Controllers\MaintenanceRequestController::class, 'index']);
        Route::post('/', [App\Http\Controllers\MaintenanceRequestController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\MaintenanceRequestController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\MaintenanceRequestController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\MaintenanceRequestController::class, 'destroy']);
    });
    
    // Service routes
    Route::prefix('services')->group(function () {
        Route::get('/', [App\Http\Controllers\ServiceController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\ServiceController::class, 'show']);
        Route::post('/', [App\Http\Controllers\ServiceController::class, 'store']);
        Route::post('/{id}', [App\Http\Controllers\ServiceController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\ServiceController::class, 'destroy']);
    });
    
    // Product routes
    Route::prefix('products')->group(function () {
        Route::get('/', [App\Http\Controllers\ProductController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\ProductController::class, 'show']);
        Route::post('/', [App\Http\Controllers\ProductController::class, 'store']);
        Route::post('/{id}', [App\Http\Controllers\ProductController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\ProductController::class, 'destroy']);
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
    
    // Booking routes
    Route::prefix('bookings')->group(function () {
        // Client routes
        Route::post('/create', [App\Http\Controllers\BookingController::class, 'create']);
        Route::get('/{booking}', [App\Http\Controllers\BookingController::class, 'show']);
        Route::get('/user/{userId}', [App\Http\Controllers\BookingController::class, 'getUserBookings']);
        Route::post('/{booking}/submit-requirements', [App\Http\Controllers\BookingController::class, 'submitRequirements']);
        Route::post('/{booking}/pay', [App\Http\Controllers\BookingController::class, 'pay']);
        
        // Admin routes
        Route::get('/', [App\Http\Controllers\BookingController::class, 'adminIndex']);
        Route::post('/{booking}/update-status', [App\Http\Controllers\BookingController::class, 'updateStatus']);
        Route::post('/{booking}/review-requirements', [App\Http\Controllers\BookingController::class, 'reviewRequirements']);
    });
});

// Public service routes (for client-side)
Route::get('/public/services', [App\Http\Controllers\ServiceController::class, 'publicIndex']);

// Public requirements route (for signup page)
Route::get('/public/requirements', [App\Http\Controllers\RequirementController::class, 'getAllRequirements']);

// Public inquiry routes (for client-side)
Route::post('/inquiries/submit', [App\Http\Controllers\InquiryController::class, 'submit']);

// User inquiry routes (protected)
Route::middleware('auth:sanctum')->prefix('inquiries')->group(function () {
    Route::get('/user', [App\Http\Controllers\InquiryController::class, 'getUserInquiries']);
});

// Admin inquiry routes (protected)
Route::middleware('auth:sanctum')->prefix('admin/inquiries')->group(function () {
    Route::get('/', [App\Http\Controllers\InquiryController::class, 'index']);
    Route::put('/{id}/status', [App\Http\Controllers\InquiryController::class, 'updateStatus']);
    Route::post('/{id}/photos', [App\Http\Controllers\InquiryController::class, 'uploadPhotos']);
    Route::delete('/{id}', [App\Http\Controllers\InquiryController::class, 'destroy']);
});

// Public contact message routes (for client-side)
Route::post('/contact/submit', [ContactMessageController::class, 'submit']);

// Public site settings routes (for client-side)
Route::get('/site-settings', [App\Http\Controllers\SiteSettingController::class, 'getPublicSettings']);

// Admin contact message routes (protected)
Route::middleware('auth:sanctum')->prefix('admin/contact-messages')->group(function () {
    Route::get('/', [ContactMessageController::class, 'index']);
    Route::put('/{id}/status', [ContactMessageController::class, 'updateStatus']);
    Route::delete('/{id}', [ContactMessageController::class, 'destroy']);
});

// Admin site settings routes (protected)
Route::middleware('auth:sanctum')->prefix('admin/site-settings')->group(function () {
    Route::get('/', [App\Http\Controllers\SiteSettingController::class, 'index']);
    Route::post('/update', [App\Http\Controllers\SiteSettingController::class, 'updateSettings']);
    Route::post('/upload-image', [App\Http\Controllers\SiteSettingController::class, 'uploadImage']);
    Route::post('/initialize-defaults', [App\Http\Controllers\SiteSettingController::class, 'initializeDefaults']);
});