<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PayMongo Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for PayMongo payment gateway integration
    |
    */

    'public_key' => env('PAYMONGO_PUBLIC_KEY', ''),
    'secret_key' => env('PAYMONGO_SECRET_KEY', ''),
    
    // Test keys (replace with live keys in production)
    'test_public_key' => env('PAYMONGO_TEST_PUBLIC_KEY', 'pk_test_your_test_public_key'),
    'test_secret_key' => env('PAYMONGO_TEST_SECRET_KEY', 'sk_test_your_test_secret_key'),
    
    'environment' => env('PAYMONGO_ENVIRONMENT', 'test'), // 'test' or 'live'
    
    'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET', ''),
    
    // Payment methods configuration
    'payment_methods' => [
        'card' => true,
        'gcash' => true,
        'grab_pay' => true,
        'paymaya' => true,
        'billease' => true,
        'dob' => true, // DragonPay Online Banking
        'dob_ubp' => true, // UnionBank
        'brankas_bdo' => true, // BDO
        'brankas_landbank' => true, // Landbank
        'brankas_metrobank' => true, // Metrobank
    ],
    
    // Currency (PHP for Philippines)
    'currency' => 'PHP',
    
    // Success and cancel URLs
    'success_url' => env('CLIENT_URL', env('CLIENT_APP_URL', 'http://localhost:3000')) . '/payment/success',
    'cancel_url' => env('CLIENT_URL', env('CLIENT_APP_URL', 'http://localhost:3000')) . '/payment/cancel',
];