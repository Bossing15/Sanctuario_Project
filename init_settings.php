<?php
// Initialize default settings via API call
require_once __DIR__ . '/bootstrap/app.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Create a request to initialize defaults
$request = \Illuminate\Http\Request::create('/api/admin/site-settings/initialize-defaults', 'POST');
$request->headers->set('Authorization', 'Bearer test-token');

// Get the kernel
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Handle the request
$response = $kernel->handle($request);

echo "Settings initialized successfully!\n";
echo $response->getContent();
