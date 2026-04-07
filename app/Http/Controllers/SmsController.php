<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\SmsLog;
use Illuminate\Http\Request;

class SmsController extends Controller
{
    public function sendSms(Request $request)
    {
        try {
            $validated = $request->validate([
                'phone' => 'required|string',
                'message' => 'required|string',
            ]);

            $smsLog = SmsLog::create([
                'phone' => $validated['phone'],
                'message' => $validated['message'],
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return response()->json([
                'message' => 'SMS sent successfully',
                'log' => $smsLog
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send SMS',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendBulkSms(Request $request)
    {
        try {
            $validated = $request->validate([
                'phones' => 'required|array',
                'message' => 'required|string',
            ]);

            $logs = [];
            foreach ($validated['phones'] as $phone) {
                $log = SmsLog::create([
                    'phone' => $phone,
                    'message' => $validated['message'],
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
                $logs[] = $log;
            }

            return response()->json([
                'message' => 'Bulk SMS sent successfully',
                'count' => count($logs),
                'logs' => $logs
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send bulk SMS',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getClients()
    {
        try {
            $clients = Client::select('id', 'name', 'phone', 'email')->get();
            
            return response()->json([
                'clients' => $clients,
                'count' => $clients->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch clients',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
