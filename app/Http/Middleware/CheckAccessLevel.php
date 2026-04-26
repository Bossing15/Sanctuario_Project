<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAccessLevel
{
    public function handle(Request $request, Closure $next, ...$levels)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userLevel = $user->access_level ?? $user->role;
        
        // Allow super_admin to access any admin-level routes
        if ($userLevel === 'super_admin' && in_array('admin', $levels)) {
            return $next($request);
        }

        if (!in_array($userLevel, $levels)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
