<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\PermissionService;

class CheckPermission
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Handle an incoming request.
     * 
     * Usage: Route::middleware('check.permission:component,action')->group(...)
     * Example: Route::middleware('check.permission:admin,edit')->group(...)
     * 
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $component
     * @param  string  $action
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $component, string $action = 'view')
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user has permission
        if (!$this->permissionService->authorize($user, $component, $action)) {
            return response()->json([
                'message' => 'Forbidden',
                'error' => "You do not have permission to {$action} {$component}"
            ], 403);
        }

        return $next($request);
    }
}
