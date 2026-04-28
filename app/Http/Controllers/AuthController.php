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
            \Illuminate\Support\Facades\Log::info('Admin login successful', [
                'username' => $admin->username,
                'remember_me' => $credentials['remember_me'] ?? false,
            ]);
            
            // Determine token expiration based on remember_me
            $rememberMe = $credentials['remember_me'] ?? false;
            $expiresAt = $rememberMe 
                ? now()->addDays(30)  // 30 days for remember me
                : now()->addHours(1); // 1 hour for regular session
            
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
            // Determine token expiration based on remember_me
            $rememberMe = $credentials['remember_me'] ?? false;
            $expiresAt = $rememberMe 
                ? now()->addDays(30)  // 30 days for remember me
                : now()->addHours(1); // 1 hour for regular session
            
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
        
        return response()->json(['message' => 'Password reset link sent to email']);
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
}
