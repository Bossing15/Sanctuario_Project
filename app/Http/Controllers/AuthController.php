<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use App\Models\Client;
use App\Models\Grave;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'token' => $token,
                'user' => $user,
                'role' => 'user'
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function adminLogin(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required',
            'remember_me' => 'nullable|boolean',
        ]);

        \Illuminate\Support\Facades\Log::info('Admin login attempt', [
            'username' => $credentials['username'],
            'remember_me' => $credentials['remember_me'] ?? false,
        ]);

        $admin = Admin::where('username', $credentials['username'])->first();

        \Illuminate\Support\Facades\Log::info('Admin lookup result', [
            'admin_found' => $admin ? true : false,
            'admin_username' => $admin?->username,
            'admin_email' => $admin?->email,
        ]);

        if ($admin && Hash::check($credentials['password'], $admin->password)) {
            // Check if admin account is active
            if ($admin->status === 'inactive' || $admin->is_active === false || $admin->is_active === 0) {
                \Illuminate\Support\Facades\Log::warning('Admin login blocked - account inactive', [
                    'username' => $admin->username,
                    'status' => $admin->status,
                    'is_active' => $admin->is_active,
                ]);
                return response()->json(['message' => 'Your account has been deactivated. Please contact an administrator.'], 403);
            }

            \Illuminate\Support\Facades\Log::info('Admin login successful', [
                'username' => $admin->username,
                'remember_me' => $credentials['remember_me'] ?? false,
            ]);
            
            // Determine token expiration based on remember_me
            $rememberMe = $credentials['remember_me'] ?? false;
            $expiresAt = $rememberMe 
                ? now()->addDays(30)  // 30 days for remember me
                : now()->addDays(7);  // 7 days for regular session (was 1 hour)
            
            $token = $admin->createToken('auth_token', ['*'], $expiresAt)->plainTextToken;
            
            return response()->json([
                'token' => $token,
                'user' => $admin,
                'role' => 'admin',
                'expires_at' => $expiresAt->timestamp,
                'remember_me' => $rememberMe,
            ]);
        }

        \Illuminate\Support\Facades\Log::warning('Admin login failed', [
            'username' => $credentials['username'],
            'admin_found' => $admin ? true : false,
            'password_match' => $admin ? Hash::check($credentials['password'], $admin->password) : false,
        ]);

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function clientLogin(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required',
            'remember_me' => 'nullable|boolean',
        ]);

        $client = Client::where('username', $credentials['username'])->first();

        if ($client && Hash::check($credentials['password'], $client->password)) {
            // Check if client account is active
            if ($client->status === 'inactive' || $client->status === 'deactivated') {
                \Illuminate\Support\Facades\Log::warning('Client login blocked - account inactive', [
                    'username' => $client->username,
                    'status' => $client->status,
                ]);
                return response()->json(['message' => 'Your account has been deactivated. Please contact support.'], 403);
            }

            // Determine token expiration based on remember_me
            $rememberMe = $credentials['remember_me'] ?? false;
            $expiresAt = $rememberMe 
                ? now()->addDays(30)  // 30 days for remember me
                : now()->addDays(7);  // 7 days for regular session (was 1 hour)
            
            $token = $client->createToken('auth_token', ['*'], $expiresAt)->plainTextToken;
            
            return response()->json([
                'token' => $token,
                'user' => $client,
                'role' => 'client',
                'expires_at' => $expiresAt->timestamp,
                'remember_me' => $rememberMe,
            ]);
        }

        // Log failed login attempt for debugging
        \Illuminate\Support\Facades\Log::warning('Failed login attempt', [
            'username' => $credentials['username'],
            'client_exists' => $client ? true : false,
            'password_matches' => $client && Hash::check($credentials['password'], $client->password) ? true : false,
        ]);

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'username' => 'nullable|string',
            'password' => 'required|string|min:6',
            'password_confirmation' => 'required|string|min:6',
            'role' => 'required|string|in:admin,client',
            'access_level' => 'nullable|string',
            'contact' => 'nullable|string',
            'permissions' => 'nullable|array',
            // Client-specific fields
            'deceased_name' => 'nullable|string',
            'grave_location' => 'nullable|string',
            'address' => 'nullable|string',
            'plot_number' => 'nullable|string',
            'phone' => 'nullable|string',
            'relationship' => 'nullable|string',
        ]);

        // Check if passwords match
        if ($validated['password'] !== $validated['password_confirmation']) {
            return response()->json(['message' => 'Passwords do not match'], 422);
        }

        // Register as Client
        if ($validated['role'] === 'client') {
            // Check if email already exists in clients table
            if (Client::where('email', $validated['email'])->exists()) {
                return response()->json(['message' => 'Email already registered'], 422);
            }

            // Check if username already exists
            if ($validated['username'] && Client::where('username', $validated['username'])->exists()) {
                return response()->json(['message' => 'Username already taken'], 422);
            }

            $client = Client::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'username' => $validated['username'] ?? null,
                'password' => Hash::make($validated['password']),
                'deceased_name' => $validated['deceased_name'] ?? null,
                'grave_location' => $validated['grave_location'] ?? null,
                'address' => $validated['address'] ?? null,
                'plot_number' => $validated['plot_number'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'relationship' => $validated['relationship'] ?? null,
                'status' => 'Active',
            ]);

            $token = $client->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Client registered successfully',
                'token' => $token,
                'user' => $client,
            ], 201);
        }

        // Register as Admin (requires username and admin permission)
        if ($validated['role'] === 'admin') {
            // Check if user is authenticated and is an admin
            $user = $request->user();
            if (!$user || ($user->access_level !== 'admin' && $user->role !== 'admin')) {
                \Illuminate\Support\Facades\Log::warning('Unauthorized attempt to create admin account', [
                    'user_id' => $user->id ?? null,
                    'user_role' => $user->access_level ?? $user->role ?? null,
                ]);
                return response()->json([
                    'message' => 'Forbidden',
                    'error' => 'Only admins can create admin accounts'
                ], 403);
            }

            $validated['username'] = $validated['username'] ?? null;
            
            if (!$validated['username']) {
                return response()->json(['message' => 'Username is required for admin registration'], 422);
            }

            // Check if email already exists in admins table
            if (Admin::where('email', $validated['email'])->exists()) {
                return response()->json(['message' => 'Email already registered'], 422);
            }

            // Check if username already exists
            if (Admin::where('username', $validated['username'])->exists()) {
                return response()->json(['message' => 'Username already taken'], 422);
            }

            $admin = Admin::create([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'access_level' => $validated['access_level'] ?? 'staff',
                'contact' => $validated['contact'] ?? null,
                'permissions' => $validated['permissions'] ?? [],
                'status' => 'Active',
            ]);

            \Illuminate\Support\Facades\Log::info('Admin account created', [
                'created_by' => $user->id,
                'admin_id' => $admin->id,
                'access_level' => $admin->access_level,
            ]);

            $token = $admin->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Admin registered successfully',
                'token' => $token,
                'user' => $admin,
            ], 201);
        }

        return response()->json(['message' => 'Invalid role'], 422);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $email = $request->email;
        
        // Check if email exists in clients or admins table
        $client = Client::where('email', $email)->first();
        $admin = Admin::where('email', $email)->first();
        
        if (!$client && !$admin) {
            return response()->json(['message' => 'Email not found'], 404);
        }
        
        // Generate a unique reset token
        $resetToken = \Illuminate\Support\Str::random(60);
        $user = $client ?? $admin;
        $userType = $client ? 'client' : 'admin';
        
        // Store reset token in cache (expires in 1 hour)
        \Illuminate\Support\Facades\Cache::put(
            'password_reset_' . $resetToken,
            [
                'email' => $email,
                'user_type' => $userType,
                'user_id' => $user->id
            ],
            now()->addHour()
        );
        
        // Send email using Resend
        try {
            $resetLink = env('FRONTEND_URL') . '/reset-password?token=' . $resetToken;
            
            $apiKey = env('RESEND_API_KEY');
            if (!$apiKey) {
                throw new \Exception('Resend API key not configured');
            }
            
            $resend = \Resend::client($apiKey);
            $response = $resend->emails->send([
                'from' => 'onboarding@resend.dev',
                'to' => $email,
                'subject' => 'Password Reset Request - Sanctuario De Carmona',
                'html' => $this->getPasswordResetEmailTemplate($user->name, $resetLink),
            ]);
            
            if (!$response || (isset($response['error']) && $response['error'])) {
                throw new \Exception('Failed to send email via Resend: ' . json_encode($response));
            }
            
            \Illuminate\Support\Facades\Log::info('Password reset email sent', [
                'email' => $email,
                'user_type' => $userType,
            ]);
            
            return response()->json([
                'message' => 'Password reset link has been sent to your email. Please check your inbox.',
                'success' => true
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send password reset email', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'message' => 'Failed to send reset email. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private function getPasswordResetEmailTemplate($name, $resetLink)
    {
        $logoUrl = env('APP_URL') . '/Sanctuario_Logo_Good.png';
        
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .logo { max-width: 120px; height: auto; margin-bottom: 20px; }
                .header h1 { margin: 10px 0 0 0; font-size: 24px; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="$logoUrl" alt="Sanctuario De Carmona" class="logo">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>$name</strong>,</p>
                    
                    <p>We received a request to reset your password for your Sanctuario De Carmona account. If you didn't make this request, you can safely ignore this email.</p>
                    
                    <p>To reset your password, click the button below:</p>
                    
                    <center>
                        <a href="$resetLink" class="button">Reset Password</a>
                    </center>
                    
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">$resetLink</p>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                    </div>
                    
                    <p>Best regards,<br><strong>Sanctuario De Carmona Team</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 Sanctuario De Carmona Memorial Park. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        HTML;
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function getAllClients()
    {
        try {
            $clients = Client::all();
            
            return response()->json([
                'clients' => $clients,
                'count' => $clients->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch clients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getClientById($id)
    {
        try {
            $client = Client::findOrFail($id);
            
            return response()->json([
                'client' => $client
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Client not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function getAllGraves()
    {
        try {
            // Get all purchased products (lawn lots, columbariums, family estates) from reservations
            $graves = Reservation::where('status', 'paid')
                ->orWhere('status', 'completed')
                ->with(['user', 'product', 'lot'])
                ->get()
                ->map(function($reservation) {
                    $productType = 'Unknown';
                    
                    if ($reservation->product) {
                        $productType = $reservation->product->title ?? $reservation->product->name ?? 'Product';
                    }
                    
                    // Determine lot location based on lot_type
                    $lotLocation = 'N/A';
                    if ($reservation->lot) {
                        $lotLocation = $reservation->lot->grave_location ?? $reservation->lot->plot_number ?? 'N/A';
                    }
                    
                    return [
                        'id' => $reservation->id,
                        'plot_number' => $reservation->lot->plot_number ?? 'N/A',
                        'grave_location' => $lotLocation,
                        'status' => $reservation->status === 'paid' ? 'Active' : 'Active',
                        'deceased_name' => $reservation->deceased_name ?? 'N/A',
                        'burial_date' => $reservation->created_at,
                        'section' => $reservation->lot->section ?? 'N/A',
                        'relationship_to_deceased' => $reservation->deceased_relationship ?? 'N/A',
                        'notes' => 'Lot Type: ' . ($reservation->lot_type ?? 'Unknown') . ' | Reservation Code: ' . ($reservation->reservation_code ?? 'N/A'),
                        'customer' => $reservation->user->name ?? 'N/A',
                        'customer_email' => $reservation->user->email ?? 'N/A',
                        'customer_phone' => $reservation->user->phone ?? 'N/A',
                        'product_type' => $productType,
                        'reservation_id' => $reservation->id,
                        'date_added' => $reservation->created_at,
                    ];
                });
            
            return response()->json([
                'graves' => $graves,
                'count' => $graves->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch graves',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getGraveById($id)
    {
        try {
            // Get the reservation (which represents a purchased grave/lot)
            $reservation = Reservation::with(['user', 'product', 'lot'])->findOrFail($id);
            
            $productType = 'Unknown';
            if ($reservation->product) {
                $productType = $reservation->product->title ?? $reservation->product->name ?? 'Product';
            }
            
            // Determine lot location based on lot_type
            $lotLocation = 'N/A';
            if ($reservation->lot) {
                $lotLocation = $reservation->lot->grave_location ?? $reservation->lot->plot_number ?? 'N/A';
            }
            
            $grave = [
                'id' => $reservation->id,
                'plot_number' => $reservation->lot->plot_number ?? 'N/A',
                'grave_location' => $lotLocation,
                'status' => $reservation->status === 'paid' ? 'Active' : 'Active',
                'deceased_name' => $reservation->deceased_name ?? 'N/A',
                'burial_date' => $reservation->created_at,
                'section' => $reservation->lot->section ?? 'N/A',
                'relationship_to_deceased' => $reservation->deceased_relationship ?? 'N/A',
                'notes' => 'Lot Type: ' . ($reservation->lot_type ?? 'Unknown') . ' | Reservation Code: ' . ($reservation->reservation_code ?? 'N/A'),
                'customer' => $reservation->user->name ?? 'N/A',
                'customer_email' => $reservation->user->email ?? 'N/A',
                'customer_phone' => $reservation->user->phone ?? 'N/A',
                'product_type' => $productType,
                'reservation_id' => $reservation->id,
                'date_added' => $reservation->created_at,
            ];
            
            return response()->json([
                'grave' => $grave
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Grave not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function getAllUsers()
    {
        try {
            $users = User::all();
            
            return response()->json([
                'users' => $users,
                'count' => $users->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllAdmins(Request $request)
    {
        try {
            $user = $request->user();

            // Only admins can view all admins
            if (!$user || ($user->access_level !== 'admin' && $user->role !== 'admin')) {
                \Illuminate\Support\Facades\Log::warning('Unauthorized attempt to view all admins', [
                    'user_id' => $user->id ?? null,
                    'user_role' => $user->access_level ?? $user->role ?? null,
                ]);
                return response()->json([
                    'message' => 'Forbidden',
                    'error' => 'Only admins can view all admins'
                ], 403);
            }

            $admins = Admin::all();
            
            return response()->json([
                'admins' => $admins,
                'count' => $admins->count()
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching admins', [
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch admins',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:6',
            'password_confirmation' => 'required|string|min:6',
        ]);
        
        // Check if passwords match
        if ($request->password !== $request->password_confirmation) {
            return response()->json(['message' => 'Passwords do not match'], 422);
        }
        
        // Retrieve reset token from cache
        $resetData = \Illuminate\Support\Facades\Cache::get('password_reset_' . $request->token);
        
        if (!$resetData) {
            return response()->json(['message' => 'Invalid or expired reset token'], 401);
        }
        
        try {
            // Update password based on user type
            if ($resetData['user_type'] === 'client') {
                $user = Client::find($resetData['user_id']);
            } else {
                $user = Admin::find($resetData['user_id']);
            }
            
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }
            
            // Update password
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
            $user->save();
            
            // Delete the reset token from cache
            \Illuminate\Support\Facades\Cache::forget('password_reset_' . $request->token);
            
            \Illuminate\Support\Facades\Log::info('Password reset successful', [
                'user_type' => $resetData['user_type'],
                'user_id' => $resetData['user_id'],
            ]);
            
            return response()->json([
                'message' => 'Password has been reset successfully. You can now log in with your new password.',
                'success' => true
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error resetting password', [
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
