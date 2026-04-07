<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function submit(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'email' => 'required|email',
                'phone' => 'nullable|string',
                'subject' => 'required|string',
                'message' => 'required|string',
            ]);

            $message = ContactMessage::create($validated);

            return response()->json([
                'message' => 'Message submitted successfully',
                'data' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $messages = ContactMessage::all();
            return response()->json([
                'messages' => $messages,
                'count' => $messages->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string',
            ]);

            $message = ContactMessage::findOrFail($id);
            $message->update($validated);

            return response()->json([
                'message' => 'Status updated successfully',
                'data' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $message = ContactMessage::findOrFail($id);
            $message->delete();

            return response()->json([
                'message' => 'Message deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete message',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
