<?php

use Illuminate\Support\Facades\Route;

// Test route to verify app is working
Route::get('/test', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Laravel is working!',
        'app_debug' => config('app.debug'),
        'app_env' => config('app.env'),
    ]);
});

// Login route for authentication redirects (returns JSON for API requests)
Route::get('/login', function () {
    if (request()->expectsJson() || request()->is('api/*')) {
        return response()->json([
            'message' => 'Unauthenticated.',
            'error' => 'Authentication required'
        ], 401);
    }
    
    // For web requests, you could redirect to your admin login page
    return redirect('/admin/login');
})->name('login');

// Catch all routes and return the React app (only for non-API routes)
Route::fallback(function () {
    return view('welcome');
});
