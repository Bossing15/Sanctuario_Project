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
                    'grave_location' => $property->grave_location ?? $property->location ?? null,
                    'location' => $property->grave_location ?? $property->location ?? null,
                    'section' => $property->section,
                    'status' => $property->status,
                    'is_occupied' => in_array($property->id, $occupiedIds),
                    'client_id' => $property->client_id,
                ];
            });
            
            return response()->json([
                'properties' => $formatted,
                'lawn_lots' => $formatted,
                'columbariums' => $formatted,
                'family_estates' => $formatted,
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
            // Validate based on property type
            $validationRules = [];
            switch ($type) {
                case 'columbariums':
                    $validationRules = ['columbarium_id' => 'required|integer'];
                    break;
                case 'family-estates':
                    $validationRules = ['estate_id' => 'required|integer'];
                    break;
                case 'lawn-lots':
                default:
                    $validationRules = ['lot_id' => 'required|integer'];
                    break;
            }

            $validated = $request->validate($validationRules);

            $model = $this->getPropertyModel($type);
            
            // Get the ID from the validated data
            $propertyId = $validated['lot_id'] ?? $validated['columbarium_id'] ?? $validated['estate_id'] ?? null;
            
            if (!$propertyId) {
                return response()->json([
                    'message' => "Invalid property ID for {$type}",
                    'error' => 'Missing property ID'
                ], 422);
            }
            
            $property = $model::findOrFail($propertyId);

            // Check if property is already occupied
            $existingBooking = Booking::where('grave_id', $propertyId)->first();

            if ($existingBooking) {
                return response()->json([
                    'message' => "This {$type} is already occupied",
                    'error' => 'Property already booked'
                ], 409);
            }

            return response()->json([
                'message' => "{$type} selected successfully",
                'property' => $property,
                'lot' => $property,
                'columbarium' => $property,
                'estate' => $property
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
