<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class OptionalAuth
{
    /**
     * Handle an incoming request - allows authentication but doesn't require it
     */
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
                }
            } catch (\Exception $e) {
                // Token lookup failed, continue without user
                \Log::error('Token lookup error in OptionalAuth', [
                    'error' => $e->getMessage(),
                    'path' => $request->path()
                ]);
            }
        }

        // Continue regardless of authentication status
        return $next($request);
    }
}
