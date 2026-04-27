<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Traits\FormSubmissionTrait;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    use FormSubmissionTrait;

    public function submit(Request $request)
    {
        return $this->handleSubmit($request, Inquiry::class, [
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'service_type' => 'required|string',
            'message' => 'required|string',
        ]);
    }

    public function getUserInquiries(Request $request)
    {
        try {
            $userEmail = $request->user()->email;
            $inquiries = Inquiry::where('email', $userEmail)->get();
            return response()->json([
                'inquiries' => $inquiries,
                'count' => $inquiries->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch inquiries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $inquiries = Inquiry::all();
            return response()->json([
                'inquiries' => $inquiries,
                'count' => $inquiries->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch inquiries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus($id, Request $request)
    {
        try {
            $inquiry = Inquiry::findOrFail($id);
            return $this->handleStatusUpdate($request, $inquiry);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadPhotos($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'photos' => 'nullable|array',
                'photos.*' => 'image|max:5120',
            ]);

            $inquiry = Inquiry::findOrFail($id);
            
            if ($request->hasFile('photos')) {
                $photos = [];
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('inquiries', 'public');
                    $photos[] = $path;
                }
                $inquiry->update(['photos' => json_encode($photos)]);
            }

            return response()->json([
                'message' => 'Photos uploaded successfully',
                'inquiry' => $inquiry
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload photos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $inquiry = Inquiry::findOrFail($id);
            return $this->handleDelete($inquiry);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete inquiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsPaid($id, Request $request)
    {
        try {
            $inquiry = Inquiry::findOrFail($id);
            
            // Update inquiry status to paid
            $inquiry->update([
                'status' => 'paid',
                'payment_status' => 'completed',
                'paid_at' => now(),
            ]);

            return response()->json([
                'message' => 'Maintenance request marked as paid successfully',
                'inquiry' => $inquiry
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to mark as paid',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createPayment($id, Request $request)
    {
        try {
            $inquiry = Inquiry::findOrFail($id);
            
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'payment_method' => 'nullable|string',
                'description' => 'nullable|string',
            ]);

            // Create payment record for this inquiry
            $payment = \App\Models\Payment::create([
                'client_id' => $request->user()->id,
                'request_id' => $inquiry->id,
                'invoice_number' => $inquiry->invoice_number,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'] ?? 'PayMongo',
                'payment_type' => 'full',
                'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                'status' => 'pending',
                'description' => $validated['description'] ?? 'Maintenance Request Payment',
                'due_date' => now()->addDays(30),
                'customer_name' => $inquiry->full_name ?? $inquiry->name ?? 'Guest',
                'service_type' => $inquiry->service_type ?? 'maintenance',
            ]);

            // Update inquiry with payment information
            $inquiry->update([
                'payment_id' => $payment->id,
                'payment_status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Payment created successfully',
                'payment' => $payment
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
