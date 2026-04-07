<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use App\Models\Client;
use App\Models\Grave;
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
        ]);

        $admin = Admin::where('username', $credentials['username'])->first();

        if ($admin && Hash::check($credentials['password'], $admin->password)) {
            $token = $admin->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'token' => $token,
                'user' => $admin,
                'role' => 'admin'
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function clientLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $client = Client::where('email', $credentials['email'])->first();

        if ($client && Hash::check($credentials['password'], $client->password)) {
            $token = $client->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'token' => $token,
                'user' => $client,
                'role' => 'client'
            ]);
        }

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

            $client = Client::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
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

        // Register as Admin (requires username)
        if ($validated['role'] === 'admin') {
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
            $graves = Grave::all();
            
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
            $grave = Grave::findOrFail($id);
            
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

    public function getAllAdmins()
    {
        try {
            $admins = Admin::all();
            
            return response()->json([
                'admins' => $admins,
                'count' => $admins->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch admins',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
