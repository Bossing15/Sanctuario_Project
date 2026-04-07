<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRequirementsPermission
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $permissions = $user->permissions ?? [];
        
        if (is_array($permissions) && isset($permissions['requirements'])) {
            if ($permissions['requirements'] === false) {
                return response()->json(['message' => 'Forbidden: No requirements permission'], 403);
            }
        }

        return $next($request);
    }
}
