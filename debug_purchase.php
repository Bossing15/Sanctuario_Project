<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get all recent bookings and payments
echo "=== Recent Bookings (Last 10) ===\n";
$bookings = \App\Models\Booking::latest()->limit(10)->get();
foreach ($bookings as $booking) {
    echo "ID: " . $booking->id . 
         ", User: " . $booking->user_id . 
         ", Product: " . ($booking->product_id ?? 'null') . 
         ", Status: " . $booking->status . 
         ", Created: " . $booking->created_at . "\n";
}

echo "\n=== Recent Payments (Last 10) ===\n";
$payments = \App\Models\Payment::latest()->limit(10)->get();
foreach ($payments as $payment) {
    echo "ID: " . $payment->id . 
         ", Client: " . $payment->client_id . 
         ", Product: " . ($payment->product_id ?? 'null') . 
         ", Booking: " . ($payment->booking_id ?? 'null') . 
         ", Status: " . $payment->status . 
         ", Created: " . $payment->created_at . "\n";
}

// Check if there are any users
echo "\n=== Users in System ===\n";
$users = \App\Models\User::all();
echo "Total users: " . count($users) . "\n";
foreach ($users as $user) {
    echo "ID: " . $user->id . ", Name: " . $user->name . ", Email: " . $user->email . "\n";
}

// Check if there are any clients
echo "\n=== Clients in System ===\n";
$clients = \App\Models\Client::all();
echo "Total clients: " . count($clients) . "\n";
foreach ($clients as $client) {
    echo "ID: " . $client->id . ", Name: " . $client->name . ", Email: " . $client->email . "\n";
}
