<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyServiceController extends Controller
{
    public function index()
    {
        try {
            $properties = Property::all();
            return response()->json([
                'properties' => $properties,
                'count' => $properties->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $property = Property::findOrFail($id);
            return response()->json([
                'property' => $property
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Property not found',
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
                $imagePath = $request->file('image')->store('properties', 'public');
                $validated['image_path'] = $imagePath;
            }

            $property = Property::create($validated);

            return response()->json([
                'message' => 'Property created successfully',
                'property' => $property
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create property',
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

            $property = Property::findOrFail($id);

            // Handle hero image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($property->image_path && Storage::disk('public')->exists($property->image_path)) {
                    Storage::disk('public')->delete($property->image_path);
                }
                $imagePath = $request->file('image')->store('properties', 'public');
                $validated['image_path'] = $imagePath;
            }

            $property->update($validated);

            return response()->json([
                'message' => 'Property updated successfully',
                'property' => $property
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $property = Property::findOrFail($id);
            
            // Delete hero image
            if ($property->image_path && Storage::disk('public')->exists($property->image_path)) {
                Storage::disk('public')->delete($property->image_path);
            }
            
            // Delete gallery images
            if ($property->gallery_images) {
                foreach ($property->gallery_images as $imagePath) {
                    if (Storage::disk('public')->exists($imagePath)) {
                        Storage::disk('public')->delete($imagePath);
                    }
                }
            }
            
            $property->delete();

            return response()->json([
                'message' => 'Property deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function publicIndex()
    {
        try {
            $properties = Property::where('status', 'active')->get();
            return response()->json([
                'properties' => $properties,
                'count' => $properties->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
