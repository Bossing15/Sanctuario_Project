<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    private $apiKey;
    private $provider;
    private $baseUrl;
    private $fromName;

    public function __construct()
    {
        $this->apiKey = env('SMS_API_KEY');
        $this->provider = env('SMS_PROVIDER', 'semaphore');
        $this->fromName = env('SMS_FROM_NAME', 'Sanctuario');
        
        // Set base URL based on provider
        if ($this->provider === 'semaphore') {
            $this->baseUrl = 'https://api.semaphore.co/api/v4';
        }
    }

    /**
     * Send SMS message to a phone number
     * 
     * @param string $phoneNumber Phone number (with country code, e.g., +63912345678)
     * @param string $message Message content
     * @param string|null $reference Optional reference ID for tracking
     * @return array Response from SMS API
     */
    public function sendSms($phoneNumber, $message, $reference = null)
    {
        try {
            if (!$this->apiKey) {
                throw new \Exception('SMS API key not configured');
            }

            // Validate phone number
            if (!$this->isValidPhoneNumber($phoneNumber)) {
                throw new \Exception('Invalid phone number format');
            }

            // Validate message
            if (empty($message)) {
                throw new \Exception('Message cannot be empty');
            }

            // Limit message to 160 characters (SMS standard)
            if (strlen($message) > 160) {
                $message = substr($message, 0, 157) . '...';
            }

            $response = $this->sendViaSemaphore($phoneNumber, $message, $reference);

            Log::info('SMS sent successfully', [
                'phone' => $this->maskPhoneNumber($phoneNumber),
                'provider' => $this->provider,
                'reference' => $reference,
                'response' => $response,
            ]);

            return [
                'success' => true,
                'message' => 'SMS sent successfully',
                'data' => $response,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to send SMS', [
                'phone' => $this->maskPhoneNumber($phoneNumber),
                'error' => $e->getMessage(),
                'reference' => $reference,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send SMS: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send bulk SMS to multiple recipients
     * 
     * @param array $recipients Array of phone numbers
     * @param string $message Message content
     * @return array Results for each recipient
     */
    public function sendBulkSms($recipients, $message)
    {
        $results = [];

        foreach ($recipients as $phoneNumber) {
            $result = $this->sendSms($phoneNumber, $message);
            $results[] = [
                'phone' => $phoneNumber,
                'success' => $result['success'],
                'message' => $result['message'],
            ];
        }

        Log::info('Bulk SMS sent', [
            'total' => count($recipients),
            'successful' => count(array_filter($results, fn($r) => $r['success'])),
        ]);

        return $results;
    }

    /**
     * Send payment reminder SMS
     * 
     * @param string $phoneNumber Customer phone number
     * @param string $customerName Customer name
     * @param float $amount Payment amount
     * @param string $dueDate Due date
     * @return array Response
     */
    public function sendPaymentReminder($phoneNumber, $customerName, $amount, $dueDate)
    {
        $message = "Hi $customerName, this is a reminder that your payment of ₱" . number_format($amount, 2) . " is due on $dueDate. Please settle your account. Thank you!";
        
        return $this->sendSms($phoneNumber, $message, 'payment_reminder');
    }

    /**
     * Send booking confirmation SMS
     * 
     * @param string $phoneNumber Customer phone number
     * @param string $customerName Customer name
     * @param string $bookingId Booking ID
     * @param string $serviceType Service type
     * @return array Response
     */
    public function sendBookingConfirmation($phoneNumber, $customerName, $bookingId, $serviceType)
    {
        $message = "Hi $customerName, your booking for $serviceType (ID: $bookingId) has been confirmed. Thank you for choosing Sanctuario!";
        
        return $this->sendSms($phoneNumber, $message, 'booking_confirmation');
    }

    /**
     * Send service completion SMS
     * 
     * @param string $phoneNumber Customer phone number
     * @param string $customerName Customer name
     * @param string $serviceType Service type
     * @return array Response
     */
    public function sendServiceCompletion($phoneNumber, $customerName, $serviceType)
    {
        $message = "Hi $customerName, your $serviceType service has been completed. Thank you for using Sanctuario!";
        
        return $this->sendSms($phoneNumber, $message, 'service_completion');
    }

    /**
     * Send via Semaphore SMS API
     * 
     * @param string $phoneNumber Phone number
     * @param string $message Message content
     * @param string|null $reference Reference ID
     * @return array Response
     */
    private function sendViaSemaphore($phoneNumber, $message, $reference = null)
    {
        $response = Http::post($this->baseUrl . '/messages', [
            'apikey' => $this->apiKey,
            'number' => $phoneNumber,
            'message' => $message,
            'reference' => $reference ?? uniqid('sms_'),
        ]);

        if (!$response->successful()) {
            throw new \Exception('SMS API error: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Validate phone number format
     * 
     * @param string $phoneNumber Phone number to validate
     * @return bool
     */
    private function isValidPhoneNumber($phoneNumber)
    {
        // Accept formats like: +63912345678, 09123456789, 63912345678
        $pattern = '/^(\+63|0|63)[0-9]{9,10}$/';
        return preg_match($pattern, $phoneNumber) === 1;
    }

    /**
     * Mask phone number for logging
     * 
     * @param string $phoneNumber Phone number to mask
     * @return string Masked phone number
     */
    private function maskPhoneNumber($phoneNumber)
    {
        $length = strlen($phoneNumber);
        $visibleChars = 4;
        $maskedChars = str_repeat('*', $length - $visibleChars);
        return substr($phoneNumber, 0, $visibleChars) . $maskedChars;
    }

    /**
     * Get SMS balance/credits
     * 
     * @return array Balance information
     */
    public function getBalance()
    {
        try {
            $response = Http::get($this->baseUrl . '/account', [
                'apikey' => $this->apiKey,
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to get balance');
            }

            return [
                'success' => true,
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get SMS balance', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
