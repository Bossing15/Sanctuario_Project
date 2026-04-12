<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    public function index()
    {
        try {
            $services = Service::all();
            return response()->json([
                'services' => $services,
                'count' => $services->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $service = Service::findOrFail($id);
            return response()->json([
                'service' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Service not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string',
                'category' => 'required|string',
                'description' => 'nullable|string',
                'price_monthly' => 'nullable|numeric|min:0',
                'price_quarterly' => 'nullable|numeric|min:0',
                'price_yearly' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|numeric|min:0|max:100',
                'pricing_title' => 'nullable|string',
                'pricing_subtitle' => 'nullable|string',
                'package_title' => 'nullable|string',
                'package_description' => 'nullable|string',
                'package_note' => 'nullable|string',
                'status' => 'required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle hero image upload
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('services', 'public');
                $validated['image_path'] = $imagePath;
            }

            $service = Service::create($validated);

            return response()->json([
                'message' => 'Service created successfully',
                'service' => $service
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'nullable|string',
                'category' => 'nullable|string',
                'description' => 'nullable|string',
                'price_monthly' => 'nullable|numeric|min:0',
                'price_quarterly' => 'nullable|numeric|min:0',
                'price_yearly' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|numeric|min:0|max:100',
                'pricing_title' => 'nullable|string',
                'pricing_subtitle' => 'nullable|string',
                'package_title' => 'nullable|string',
                'package_description' => 'nullable|string',
                'package_note' => 'nullable|string',
                'status' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $service = Service::findOrFail($id);

            // Handle hero image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($service->image_path && Storage::disk('public')->exists($service->image_path)) {
                    Storage::disk('public')->delete($service->image_path);
                }
                $imagePath = $request->file('image')->store('services', 'public');
                $validated['image_path'] = $imagePath;
            }

            $service->update($validated);

            return response()->json([
                'message' => 'Service updated successfully',
                'service' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $service = Service::findOrFail($id);
            
            // Delete hero image
            if ($service->image_path && Storage::disk('public')->exists($service->image_path)) {
                Storage::disk('public')->delete($service->image_path);
            }
            
            // Delete gallery images
            if ($service->gallery_images) {
                foreach ($service->gallery_images as $imagePath) {
                    if (Storage::disk('public')->exists($imagePath)) {
                        Storage::disk('public')->delete($imagePath);
                    }
                }
            }
            
            $service->delete();

            return response()->json([
                'message' => 'Service deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function publicIndex()
    {
        try {
            $services = Service::where('status', 'active')->get();
            return response()->json([
                'services' => $services,
                'count' => $services->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch services',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
