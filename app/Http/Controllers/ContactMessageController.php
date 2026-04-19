<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Traits\FormSubmissionTrait;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    use FormSubmissionTrait;

    public function submit(Request $request)
    {
        return $this->handleSubmit($request, ContactMessage::class, [
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);
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
            $message = ContactMessage::findOrFail($id);
            return $this->handleStatusUpdate($request, $message);
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
            return $this->handleDelete($message);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete message',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
