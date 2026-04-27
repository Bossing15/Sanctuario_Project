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
            
            // Get occupied properties from Bookings (grave_id field)
            $occupiedFromBookings = Booking::whereNotNull('grave_id')->pluck('grave_id')->toArray();
            
            // Get reserved properties from Reservations (lot_id field) - only pending and approved
            // IMPORTANT: Filter by lot_type to only get reservations for this specific property type
            $reservedFromReservations = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
                ->where('lot_type', $type)  // Only get reservations for this specific property type
                ->whereNotNull('lot_id')
                ->pluck('lot_id')
                ->toArray();
            
            // Combine both occupied and reserved IDs
            $occupiedIds = array_unique(array_merge($occupiedFromBookings, $reservedFromReservations));
            
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
            
            // Check if occupied by a booking
            $booking = Booking::where('grave_id', $propertyId)->first();
            
            // Check if reserved by a reservation (pending or approved status)
            // IMPORTANT: Filter by lot_type to only get reservations for this specific property type
            $reservation = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
                ->where('lot_type', $type)  // Only get reservations for this specific property type
                ->where('lot_id', $propertyId)
                ->first();
            
            $isOccupied = $booking || $reservation;
            
            return response()->json([
                'property' => $property,
                'is_occupied' => $isOccupied ? true : false,
                'booking' => $booking,
                'reservation' => $reservation,
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
