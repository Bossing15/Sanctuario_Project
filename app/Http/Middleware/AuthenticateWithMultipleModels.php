<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AuthenticateWithMultipleModels
{
    public function handle(Request $request, Closure $next)
    {
        // Get the token from the Authorization header
        $token = $request->bearerToken();

        if ($token) {
            try {
                // Find the personal access token
                $personalAccessToken = PersonalAccessToken::findToken($token);

                if ($personalAccessToken) {
                    // Set the user on the request
                    $request->setUserResolver(function () use ($personalAccessToken) {
                        return $personalAccessToken->tokenable;
                    });
                    
                    // Continue to next middleware
                    return $next($request);
                } else {
                    // Token not found in database
                    \Log::warning('Token not found in database', [
                        'token_prefix' => substr($token, 0, 20),
                        'token_length' => strlen($token),
                        'path' => $request->path()
                    ]);
                }
            } catch (\Exception $e) {
                // Token lookup failed
                \Log::error('Token lookup error', [
                    'error' => $e->getMessage(),
                    'path' => $request->path()
                ]);
            }
        } else {
            // No token provided
            \Log::debug('No bearer token provided', ['path' => $request->path()]);
        }

        // No valid token found, return 401
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
