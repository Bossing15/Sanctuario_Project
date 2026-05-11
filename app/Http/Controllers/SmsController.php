<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\SmsLog;
use App\Models\PaymentPlan;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SmsController extends Controller
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
        try {
            $validated = $request->validate([
                'phone' => 'required|string',
                'message' => 'required|string|max:160',
                'reference' => 'nullable|string',
            ]);

            // Send via SMS service
            $result = $this->smsService->sendSms(
                $validated['phone'],
                $validated['message'],
                $validated['reference'] ?? null
            );

            // Log the SMS
            $smsLog = SmsLog::create([
                'phone_number' => $validated['phone'],
                'message' => $validated['message'],
                'type' => 'general',
                'status' => $result['success'] ? 'sent' : 'failed',
                'error_message' => $result['success'] ? null : ($result['error'] ?? 'Unknown error'),
                'sent_at' => now(),
                'reference' => $validated['reference'] ?? null,
                'response' => json_encode($result['data'] ?? []),
            ]);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'log' => $smsLog,
                'data' => $result['data'] ?? null,
            ], $result['success'] ? 201 : 500);
        } catch (\Exception $e) {
            Log::error('Error sending SMS', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to send SMS',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send bulk SMS to multiple users
     */
    public function sendBulkSms(Request $request)
    {
        try {
            $validated = $request->validate([
                'phones' => 'required|array',
                'phones.*' => 'required|string',
                'message' => 'required|string|max:160',
            ]);

            $results = $this->smsService->sendBulkSms(
                $validated['phones'],
                $validated['message']
            );

            // Log all SMS
            $logs = [];
            foreach ($results as $result) {
                $log = SmsLog::create([
                    'phone_number' => $result['phone'],
                    'message' => $validated['message'],
                    'type' => 'general',
                    'status' => $result['success'] ? 'sent' : 'failed',
                    'error_message' => $result['success'] ? null : $result['message'],
                    'sent_at' => now(),
                    'response' => json_encode($result),
                ]);
                $logs[] = $log;
            }

            $successCount = count(array_filter($results, fn($r) => $r['success']));

            return response()->json([
                'success' => true,
                'message' => "SMS sent to $successCount out of " . count($results) . " recipients",
                'count' => count($results),
                'successful' => $successCount,
                'results' => $results,
                'logs' => $logs,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error sending bulk SMS', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to send bulk SMS',
                'error' => $e->getMessage()
            ], 500);
        }
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
            $logs = [];

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
                    'plan_id' => $plan->id,
                    'amount' => $plan->amount,
                    'due_date' => $plan->next_due_date->format('M d, Y'),
                    'success' => $result['success'],
                    'message' => $result['message'],
                ];

                // Log the SMS
                $log = SmsLog::create([
                    'phone_number' => $plan->client->phone,
                    'message' => "Payment reminder for ₱" . number_format($plan->amount, 2),
                    'type' => 'payment_reminder',
                    'status' => $result['success'] ? 'sent' : 'failed',
                    'error_message' => $result['success'] ? null : $result['message'],
                    'sent_at' => now(),
                    'reference' => 'payment_reminder_' . $plan->id,
                    'response' => json_encode($result),
                ]);
                $logs[] = $log;

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
                'logs' => $logs,
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
        try {
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

            // Log the SMS
            $smsLog = SmsLog::create([
                'phone_number' => $client->phone,
                'message' => "Booking confirmation for " . $validated['service_type'],
                'type' => 'payment_confirmation',
                'status' => $result['success'] ? 'sent' : 'failed',
                'error_message' => $result['success'] ? null : $result['message'],
                'sent_at' => now(),
                'reference' => 'booking_' . $validated['booking_id'],
                'response' => json_encode($result),
            ]);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'log' => $smsLog,
            ], $result['success'] ? 201 : 500);
        } catch (\Exception $e) {
            Log::error('Error sending booking confirmation', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to send booking confirmation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SMS logs
     */
    public function getSmsLogs(Request $request)
    {
        try {
            $limit = $request->input('limit', 50);
            $offset = $request->input('offset', 0);

            $logs = SmsLog::orderBy('created_at', 'desc')
                ->limit($limit)
                ->offset($offset)
                ->get();

            $total = SmsLog::count();

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

    /**
     * Get SMS balance/credits
     */
    public function getBalance()
    {
        $result = $this->smsService->getBalance();
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Get clients for SMS sending
     */
    public function getClients()
    {
        try {
            $clients = Client::select('id', 'name', 'phone', 'email')
                ->whereNotNull('phone')
                ->get();
            
            return response()->json([
                'success' => true,
                'clients' => $clients,
                'count' => $clients->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching clients', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch clients',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
