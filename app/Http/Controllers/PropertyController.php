<?php

namespace App\Http\Controllers;

use App\Models\LawnLot;
use App\Models\Columbarium;
use App\Models\FamilyEstate;
use App\Models\Booking;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * Get all properties of a specific type with their status
     */
    public function getProperties(Request $request, $type)
    {
        try {
            $model = $this->getPropertyModel($type);
            $properties = $model::all();
            
            // Get occupied properties (those with bookings)
            $occupiedIds = Booking::whereNotNull('grave_id')->pluck('grave_id')->toArray();
            
            // Format properties with availability status
            $formatted = $properties->map(function ($property) use ($occupiedIds) {
                return [
                    'id' => $property->id,
                    'plot_number' => $property->plot_number ?? $property->niche_number ?? null,
                    'location' => $property->grave_location ?? $property->location ?? null,
                    'section' => $property->section,
                    'status' => $property->status,
                    'is_occupied' => in_array($property->id, $occupiedIds),
                    'client_id' => $property->client_id,
                ];
            });
            
            return response()->json([
                'properties' => $formatted,
                'total' => $formatted->count(),
                'occupied' => count($occupiedIds),
                'available' => $formatted->count() - count($occupiedIds),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => "Failed to fetch {$type}",
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Select a property for a booking
     */
    public function selectProperty(Request $request, $type)
    {
        try {
            $validated = $request->validate([
                'property_id' => 'required|integer',
            ]);

            $model = $this->getPropertyModel($type);
            $property = $model::findOrFail($validated['property_id']);

            // Check if property is already occupied
            $existingBooking = Booking::where('grave_id', $validated['property_id'])->first();

            if ($existingBooking) {
                return response()->json([
                    'message' => "This {$type} is already occupied",
                    'error' => 'Property already booked'
                ], 409);
            }

            return response()->json([
                'message' => "{$type} selected successfully",
                'property' => $property
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => "Failed to select {$type}",
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get property details
     */
    public function getPropertyDetails($type, $propertyId)
    {
        try {
            $model = $this->getPropertyModel($type);
            $property = $model::findOrFail($propertyId);
            
            // Check if occupied
            $booking = Booking::where('grave_id', $propertyId)->first();
            
            return response()->json([
                'property' => $property,
                'is_occupied' => $booking ? true : false,
                'booking' => $booking,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => "Failed to fetch {$type} details",
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get the appropriate model based on property type
     */
    private function getPropertyModel($type)
    {
        switch ($type) {
            case 'lawn-lots':
                return LawnLot::class;
            case 'columbariums':
                return Columbarium::class;
            case 'family-estates':
                return FamilyEstate::class;
            default:
                throw new \Exception("Invalid property type: {$type}");
        }
    }
}
