<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        // Get the origin from the request
        $origin = $request->header('Origin');
        
        // List of allowed origins
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:8000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3002',
            'http://127.0.0.1:3003',
            'http://127.0.0.1:8000',
        ];
        
        // Check if origin is localhost or 127.0.0.1 (for local development)
        $isLocalhost = $origin && (
            strpos($origin, 'localhost') !== false || 
            strpos($origin, '127.0.0.1') !== false
        );
        
        // Determine which origin to allow
        $allowOrigin = ($isLocalhost || in_array($origin, $allowedOrigins)) ? $origin : null;
        
        // If no valid origin, use default
        if (!$allowOrigin) {
            $allowOrigin = 'http://localhost:3002';
        }

        // Handle preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $allowOrigin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        // Process the request
        $response = $next($request);

        // Add CORS headers to response
        $response->header('Access-Control-Allow-Origin', $allowOrigin)
                 ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
                 ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
                 ->header('Access-Control-Allow-Credentials', 'true')
                 ->header('Access-Control-Expose-Headers', 'Content-Length, X-JSON-Response-Code');

        return $response;
    }
}
