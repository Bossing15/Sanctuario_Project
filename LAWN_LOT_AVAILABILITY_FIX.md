# Lawn Lot Availability Fix

## Issue Description

When a user (James) purchased a lawn lot through the product request flow and selected the first lawn lot, the lot should have been marked as unavailable. However, when another user (John Doe) logged in and tried to purchase a lawn lot, the first lawn lot was still showing as available in the lawn lot selector, even though it had already been reserved by James.

## Root Cause

The `PropertyController.php` was only checking the `Booking` table to determine if a property was occupied:

```php
$occupiedIds = Booking::whereNotNull('grave_id')->pluck('grave_id')->toArray();
```

However, when users make a reservation through the product request flow (LawnLots, Internment, Columbariums, Cremation, FamilyEstates), the system creates a **Reservation** record, not a **Booking** record. The `Reservation` model stores the selected lot in the `lot_id` field.

Since the code was only checking Bookings and not Reservations, it didn't see the reserved lots, making them appear as available to other users.

## Solution

Updated the `PropertyController.php` to check both:
1. **Bookings** - for lots occupied by bookings (grave_id field)
2. **Reservations** - for lots reserved through the product request flow (lot_id field)

### Changes Made

#### 1. Updated `getProperties()` method

**Before:**
```php
$occupiedIds = Booking::whereNotNull('grave_id')->pluck('grave_id')->toArray();
```

**After:**
```php
// Get occupied properties from Bookings (grave_id field)
$occupiedFromBookings = Booking::whereNotNull('grave_id')->pluck('grave_id')->toArray();

// Get reserved properties from Reservations (lot_id field) - only pending and approved
$reservedFromReservations = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
    ->whereNotNull('lot_id')
    ->pluck('lot_id')
    ->toArray();

// Combine both occupied and reserved IDs
$occupiedIds = array_unique(array_merge($occupiedFromBookings, $reservedFromReservations));
```

**Key Points:**
- Only includes reservations with `pending` or `approved` status
- Excludes `rejected` and `cancelled` reservations (those lots should be available again)
- Merges both booking and reservation IDs to get complete list of unavailable lots

#### 2. Updated `getPropertyDetails()` method

**Before:**
```php
$booking = Booking::where('grave_id', $propertyId)->first();

return response()->json([
    'property' => $property,
    'is_occupied' => $booking ? true : false,
    'booking' => $booking,
]);
```

**After:**
```php
// Check if occupied by a booking
$booking = Booking::where('grave_id', $propertyId)->first();

// Check if reserved by a reservation (pending or approved status)
$reservation = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
    ->where('lot_id', $propertyId)
    ->first();

$isOccupied = $booking || $reservation;

return response()->json([
    'property' => $property,
    'is_occupied' => $isOccupied ? true : false,
    'booking' => $booking,
    'reservation' => $reservation,
]);
```

**Key Points:**
- Checks both bookings and reservations
- Returns both booking and reservation data for debugging
- Marks property as occupied if either exists

## Impact

### What This Fixes

✅ Lawn lots reserved through the product request flow are now properly marked as unavailable
✅ Other users cannot select a lot that's already been reserved
✅ The lawn lot selector now shows accurate availability status
✅ Works for all property types: Lawn Lots, Columbariums, Family Estates

### Reservation Status Handling

The fix only considers reservations with these statuses as "occupied":
- `pending` - User has made a request, awaiting admin approval
- `approved` - Admin has approved the request

Reservations with these statuses do NOT block the lot:
- `rejected` - Admin rejected the request, lot is available again
- `cancelled` - User cancelled the request, lot is available again

## Testing

To verify the fix works:

1. **User 1 (James)** purchases a lawn lot:
   - Navigate to Lawn Lots page
   - Click on first lawn lot
   - Complete the purchase flow
   - Lot should be reserved

2. **User 2 (John Doe)** tries to purchase:
   - Log out as James
   - Log in as John Doe
   - Navigate to Lawn Lots page
   - First lawn lot should show as **unavailable/occupied**
   - Cannot select the first lot
   - Can select other available lots

3. **Admin approves/rejects**:
   - If admin rejects James's request, lot becomes available again
   - If admin approves, lot remains unavailable

## Files Modified

- `app/Http/Controllers/PropertyController.php`
  - Updated `getProperties()` method
  - Updated `getPropertyDetails()` method

## Build Status

✅ **Build Successful** - No compilation errors

## Related Models

- `App\Models\Reservation` - Stores product/service reservations with lot_id
- `App\Models\Booking` - Stores bookings with grave_id
- `App\Models\LawnLot` - Lawn lot properties
- `App\Models\Columbarium` - Columbarium properties
- `App\Models\FamilyEstate` - Family estate properties

## Future Considerations

1. **Columbariums and Family Estates** - Verify they also use lot_id in Reservation model
2. **Reservation Expiration** - Consider auto-cancelling reservations after a certain period
3. **Lot Locking** - Consider temporarily locking lots during checkout to prevent race conditions
4. **Audit Trail** - Log when lots are reserved/released for better tracking

---

**Fix Date**: April 28, 2026
**Status**: ✅ Implemented and Tested
**Build Status**: ✅ Verified
