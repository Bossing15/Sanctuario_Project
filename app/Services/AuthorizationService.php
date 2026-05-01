<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Client;
use App\Models\Service;
use App\Models\Property;
use App\Models\Grave;
use App\Models\LawnLot;
use App\Models\Columbarium;
use App\Models\FamilyEstate;

class AuthorizationService
{
    /**
     * Determine if a booking should be auto-approved or requires authorization
     * 
     * @param Booking $booking
     * @return string 'AUTO_APPROVED' or 'PENDING_AUTHORIZATION'
     */
    public function determineAuthorizationStatus(Booking $booking): string
    {
        // For PRODUCTS (Lawn Lots, Columbariums, Family Estates)
        if ($booking->product_id) {
            return $this->checkProductAuthorization($booking);
        }

        // For SERVICES
        if ($booking->service_id) {
            return $this->checkServiceAuthorization($booking);
        }

        // Default to auto-approved if neither product nor service
        return 'AUTO_APPROVED';
    }

    /**
     * Check authorization for product purchases
     * Products are auto-approved if the lot is available
     * 
     * @param Booking $booking
     * @return string
     */
    private function checkProductAuthorization(Booking $booking): string
    {
        // Get the property to determine lot type
        $property = Property::find($booking->product_id);
        if (!$property) {
            return 'AUTO_APPROVED';
        }

        // If no lot selected, auto-approve (service-like property)
        if (!$booking->grave_id) {
            return 'AUTO_APPROVED';
        }

        // Check if lot is available based on property type
        $isAvailable = $this->isLotAvailable($property->slug, $booking->grave_id);

        return $isAvailable ? 'AUTO_APPROVED' : 'REJECTED';
    }

    /**
     * Check authorization for service purchases
     * Services require authorization if:
     * - Customer is NOT linked to the selected plot, OR
     * - Plot doesn't exist in system
     * 
     * @param Booking $booking
     * @return string
     */
    private function checkServiceAuthorization(Booking $booking): string
    {
        // If no plot selected, require authorization
        if (!$booking->grave_id) {
            return 'PENDING_AUTHORIZATION';
        }

        // Get the customer
        $customer = Client::find($booking->user_id);
        if (!$customer) {
            return 'PENDING_AUTHORIZATION';
        }

        // Check if customer is linked to the plot
        // A customer is linked if they have a plot_number matching the grave_id
        $grave = Grave::find($booking->grave_id);
        if (!$grave) {
            return 'PENDING_AUTHORIZATION';
        }

        // Check if customer's plot_number matches the grave's plot_number
        if ($customer->plot_number && $grave->plot_number && $customer->plot_number === $grave->plot_number) {
            return 'AUTO_APPROVED';
        }

        // Check if customer is the owner of the grave
        if ($grave->client_id === $customer->id) {
            return 'AUTO_APPROVED';
        }

        // Otherwise, require authorization
        return 'PENDING_AUTHORIZATION';
    }

    /**
     * Check if a lot is available (not occupied)
     * 
     * @param string $productSlug
     * @param int $lotId
     * @return bool
     */
    private function isLotAvailable(string $productSlug, int $lotId): bool
    {
        // Check if lot is already booked
        $existingBooking = Booking::where('grave_id', $lotId)->first();
        if ($existingBooking) {
            return false;
        }

        // Verify lot exists based on product type
        switch ($productSlug) {
            case 'lawn-lots':
                return LawnLot::find($lotId) !== null;
            case 'columbariums':
                return Columbarium::find($lotId) !== null;
            case 'family-estates':
                return FamilyEstate::find($lotId) !== null;
            default:
                return Grave::find($lotId) !== null;
        }
    }

    /**
     * Get authorization status label for display
     * 
     * @param string $status
     * @return string
     */
    public function getStatusLabel(string $status): string
    {
        $labels = [
            'AUTO_APPROVED' => 'Auto-Approved',
            'PENDING_AUTHORIZATION' => 'Pending Approval',
            'AUTHORIZED' => 'Authorized',
            'REJECTED' => 'Rejected',
        ];

        return $labels[$status] ?? $status;
    }
}
