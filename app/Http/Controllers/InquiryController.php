<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function submit(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'email' => 'required|email',
                'phone' => 'nullable|string',
                'service_type' => 'required|string',
                'message' => 'required|string',
            ]);

            $inquiry = Inquiry::create($validated);

            return response()->json([
                'message' => 'Inquiry submitted successfully',
                'inquiry' => $inquiry
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit inquiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserInquiries(Request $request)
    {
        try {
            $inquiries = Inquiry::where('user_id', $request->user()->id)->get();
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
            $validated = $request->validate([
                'status' => 'required|string',
            ]);

            $inquiry = Inquiry::findOrFail($id);
            $inquiry->update($validated);

            return response()->json([
                'message' => 'Status updated successfully',
                'inquiry' => $inquiry
            ]);
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
            $inquiry->delete();

            return response()->json([
                'message' => 'Inquiry deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete inquiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
