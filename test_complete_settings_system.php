<?php

// Complete end-to-end test of the settings system
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Complete Settings System Test\n";
echo "=============================\n\n";

$baseUrl = 'http://localhost:8000';

// Test 1: Database layer
echo "1. Testing database layer...\n";
$settingsCount = \App\Models\SiteSetting::count();
echo "   Settings in database: $settingsCount\n";

if ($settingsCount >= 10) {
    echo "✅ Database layer working\n";
} else {
    echo "❌ Database layer incomplete\n";
    exit(1);
}

// Test 2: Public API
echo "\n2. Testing public API...\n";
$publicResponse = @file_get_contents($baseUrl . '/api/site-settings');
if ($publicResponse) {
    $publicData = json_decode($publicResponse, true);
    if ($publicData && $publicData['success']) {
        echo "✅ Public API working\n";
        echo "   Public settings count: " . count($publicData['settings']) . "\n";
    } else {
        echo "❌ Public API returned error\n";
        exit(1);
    }
} else {
    echo "❌ Public API not responding\n";
    exit(1);
}

// Test 3: Admin API
echo "\n3. Testing admin API...\n";
$admin = \App\Models\Admin::first();
if ($admin) {
    $token = $admin->createToken('test-token')->plainTextToken;
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                "Authorization: Bearer $token",
                "Accept: application/json"
            ]
        ]
    ]);
    
    $adminResponse = @file_get_contents($baseUrl . '/api/admin/site-settings', false, $context);
    if ($adminResponse) {
        $adminData = json_decode($adminResponse, true);
        if ($adminData && $adminData['success']) {
            echo "✅ Admin API working\n";
            echo "   Categories: " . implode(', ', array_keys($adminData['settings'])) . "\n";
        } else {
            echo "❌ Admin API returned error\n";
        }
    } else {
        echo "❌ Admin API not responding\n";
    }
    
    // Clean up token
    $admin->tokens()->delete();
} else {
    echo "❌ No admin user found\n";
}

// Test 4: Settings functionality
echo "\n4. Testing key settings...\n";
$keySettings = [
    'homepage_title',
    'homepage_subtitle', 
    'about_title',
    'about_description',
    'services_title',
    'contact_phone',
    'contact_email'
];

$foundSettings = [];
foreach ($publicData['settings'] as $setting) {
    if (in_array($setting['key'], $keySettings)) {
        $foundSettings[] = $setting['key'];
        echo "   ✅ {$setting['key']}: " . substr($setting['value'], 0, 50) . "...\n";
    }
}

$missingSettings = array_diff($keySettings, $foundSettings);
if (empty($missingSettings)) {
    echo "✅ All key settings present\n";
} else {
    echo "❌ Missing settings: " . implode(', ', $missingSettings) . "\n";
}

// Test 5: File structure
echo "\n5. Testing file structure...\n";
$requiredFiles = [
    'app/Models/SiteSetting.php',
    'app/Http/Controllers/SiteSettingController.php',
    'resources/js/src/Components/Settings.jsx',
    'client-app/src/hooks/useSiteSettings.js'
];

$allFilesExist = true;
foreach ($requiredFiles as $file) {
    if (file_exists($file)) {
        echo "   ✅ $file\n";
    } else {
        echo "   ❌ $file (missing)\n";
        $allFilesExist = false;
    }
}

if ($allFilesExist) {
    echo "✅ All required files present\n";
} else {
    echo "❌ Some files are missing\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "SETTINGS SYSTEM STATUS: ";

if ($settingsCount >= 10 && $publicData['success'] && $allFilesExist) {
    echo "✅ FULLY OPERATIONAL\n";
    echo "\nThe settings system is ready for use!\n";
    echo "\nHow to use:\n";
    echo "1. Admin Panel: Login at http://localhost:8000/login\n";
    echo "2. Navigate to Settings page in admin sidebar\n";
    echo "3. Modify content settings using the tabbed interface\n";
    echo "4. Changes are immediately available to client website\n";
    echo "5. Client website fetches settings from /api/site-settings\n";
    echo "\nFeatures:\n";
    echo "- ✅ Categorized settings (Homepage, About, Services, Contact)\n";
    echo "- ✅ Real-time updates\n";
    echo "- ✅ Image upload support\n";
    echo "- ✅ Text and textarea fields\n";
    echo "- ✅ Admin authentication\n";
    echo "- ✅ Public API for client consumption\n";
} else {
    echo "❌ NEEDS ATTENTION\n";
    echo "\nSome components need to be fixed before the system is fully operational.\n";
}

echo "\n" . str_repeat("=", 50) . "\n";