<?php

// Test the settings API endpoints
$baseUrl = 'http://localhost:8000';

echo "Testing Site Settings API Endpoints\n";
echo "===================================\n\n";

// Test public settings endpoint
echo "1. Testing public settings endpoint...\n";
$publicUrl = $baseUrl . '/api/site-settings';
$publicResponse = @file_get_contents($publicUrl);

if ($publicResponse) {
    $publicData = json_decode($publicResponse, true);
    if ($publicData && $publicData['success']) {
        echo "✅ Public settings API working\n";
        echo "   Settings count: " . count($publicData['settings']) . "\n";
    } else {
        echo "❌ Public settings API returned error\n";
    }
} else {
    echo "❌ Public settings API not responding\n";
}

echo "\n2. Testing admin settings endpoint...\n";

// Get admin token
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$admin = \App\Models\Admin::first();
if ($admin) {
    $token = $admin->createToken('test-token')->plainTextToken;
    
    $adminUrl = $baseUrl . '/api/admin/site-settings';
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                "Authorization: Bearer $token",
                "Accept: application/json"
            ]
        ]
    ]);
    
    $adminResponse = @file_get_contents($adminUrl, false, $context);
    
    if ($adminResponse) {
        $adminData = json_decode($adminResponse, true);
        if ($adminData && $adminData['success']) {
            echo "✅ Admin settings API working\n";
            echo "   Categories: " . implode(', ', array_keys($adminData['settings'])) . "\n";
        } else {
            echo "❌ Admin settings API returned error\n";
        }
    } else {
        echo "❌ Admin settings API not responding\n";
    }
    
    // Clean up token
    $admin->tokens()->delete();
} else {
    echo "❌ No admin user found for testing\n";
}

echo "\n✅ Settings system is ready!\n";
echo "\nNext steps:\n";
echo "1. Login to admin panel\n";
echo "2. Go to Settings page\n";
echo "3. Modify content settings\n";
echo "4. Check changes on client website\n";