<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\PaymentPlan;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SmsNotificationController extends Controller
{
    private $smsService;

    public function __construct(SmsService $smsService)
    {
        $this->smsService = $smsService;
    }

    /**
     * Send SMS to a single user
     */
    public function sendSms(Request $request)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string',
            'message' => 'required|string|max:160',
            'reference' => 'nullable|string',
        ]);

        $result = $this->smsService->sendSms(
            $validated['phone_number'],
            $validated['message'],
            $validated['reference'] ?? null
        );

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Send bulk SMS to multiple users
     */
    public function sendBulkSms(Request $request)
    {
        $validated = $request->validate([
            'phone_numbers' => 'required|array',
            'phone_numbers.*' => 'required|string',
            'message' => 'required|string|max:160',
        ]);

        $results = $this->smsService->sendBulkSms(
            $validated['phone_numbers'],
            $validated['message']
        );

        $successCount = count(array_filter($results, fn($r) => $r['success']));

        return response()->json([
            'success' => true,
            'message' => "SMS sent to $successCount out of " . count($results) . " recipients",
            'results' => $results,
        ]);
    }

    /**
     * Send payment reminders to customers with due payments
     */
    public function sendPaymentReminders(Request $request)
    {
        try {
            $daysUntilDue = $request->input('days_until_due', 3); // Default: 3 days before due date

            // Find payment plans that are due soon
            $paymentPlans = PaymentPlan::where('status', 'active')
                ->whereDate('next_due_date', '<=', now()->addDays($daysUntilDue))
                ->whereDate('next_due_date', '>=', now())
                ->with('client')
                ->get();

            if ($paymentPlans->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No payment reminders to send',
                    'count' => 0,
                ]);
            }

            $results = [];
            foreach ($paymentPlans as $plan) {
                if (!$plan->client || !$plan->client->phone) {
                    Log::warning('Payment plan client missing phone', ['plan_id' => $plan->id]);
                    continue;
                }

                $result = $this->smsService->sendPaymentReminder(
                    $plan->client->phone,
                    $plan->client->name,
                    $plan->amount,
                    $plan->next_due_date->format('M d, Y')
                );

                $results[] = [
                    'client_id' => $plan->client->id,
                    'client_name' => $plan->client->name,
                    'phone' => $plan->client->phone,
                    'success' => $result['success'],
                    'message' => $result['message'],
                ];

                // Log the reminder
                Log::info('Payment reminder sent', [
                    'client_id' => $plan->client->id,
                    'plan_id' => $plan->id,
                    'success' => $result['success'],
                ]);
            }

            $successCount = count(array_filter($results, fn($r) => $r['success']));

            return response()->json([
                'success' => true,
                'message' => "Payment reminders sent to $successCount out of " . count($results) . " clients",
                'count' => count($results),
                'successful' => $successCount,
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            Log::error('Error sending payment reminders', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send payment reminders',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send booking confirmation SMS
     */
    public function sendBookingConfirmation(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|integer|exists:clients,id',
            'booking_id' => 'required|string',
            'service_type' => 'required|string',
        ]);

        $client = Client::findOrFail($validated['client_id']);

        if (!$client->phone) {
            return response()->json([
                'success' => false,
                'message' => 'Client phone number not found',
            ], 400);
        }

        $result = $this->smsService->sendBookingConfirmation(
            $client->phone,
            $client->name,
            $validated['booking_id'],
            $validated['service_type']
        );

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Send service completion SMS
     */
    public function sendServiceCompletion(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|integer|exists:clients,id',
            'service_type' => 'required|string',
        ]);

        $client = Client::findOrFail($validated['client_id']);

        if (!$client->phone) {
            return response()->json([
                'success' => false,
                'message' => 'Client phone number not found',
            ], 400);
        }

        $result = $this->smsService->sendServiceCompletion(
            $client->phone,
            $client->name,
            $validated['service_type']
        );

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Get SMS balance/credits
     */
    public function getBalance()
    {
        $result = $this->smsService->getBalance();

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Get SMS logs
     */
    public function getSmsLogs(Request $request)
    {
        try {
            $limit = $request->input('limit', 50);
            $offset = $request->input('offset', 0);

            $logs = \App\Models\SmsLog::orderBy('created_at', 'desc')
                ->limit($limit)
                ->offset($offset)
                ->get();

            $total = \App\Models\SmsLog::count();

            return response()->json([
                'success' => true,
                'data' => $logs,
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching SMS logs', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SMS logs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
