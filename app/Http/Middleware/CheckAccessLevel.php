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

        if (!in_array($user->access_level ?? $user->role, $levels)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
