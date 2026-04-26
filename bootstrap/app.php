<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable custom CORS middleware for API routes
        $middleware->api(prepend: [
            \App\Http\Middleware\Cors::class,
        ]);
        
        // Completely disable CSRF for API routes
        $middleware->api(remove: [
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
        ]);
        
        // Also remove session middleware from API routes
        $middleware->api(remove: [
            \Illuminate\Session\Middleware\StartSession::class,
        ]);

        // Register middleware aliases
        $middleware->alias([
            'access.level' => \App\Http\Middleware\CheckAccessLevel::class,
            'billing.permission' => \App\Http\Middleware\CheckBillingPermission::class,
            'requirements.permission' => \App\Http\Middleware\CheckRequirementsPermission::class,
            'auth.multiple' => \App\Http\Middleware\AuthenticateWithMultipleModels::class,
            'auth.optional' => \App\Http\Middleware\OptionalAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
