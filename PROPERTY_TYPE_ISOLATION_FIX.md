# Property Type Isolation Fix

## Issue Description

When viewing the lot selector for different products (Lawn Lots, Columbariums, Family Estates), all three selectors were showing the same occupied lots. For example:

- User purchases Lawn Lot 1
- When viewing Family Estates lot selector, Lot 1 was showing as occupied (WRONG)
- Family Estates should have its own separate lot selector with no occupied spots

Each product type should have its own independent lot selector that only shows occupied spots for that specific product type.

## Root Cause

The `PropertyController.php` was not filtering reservations by `lot_type` when determining which lots are occupied. It was checking all reservations regardless of which product type they belonged to.

**Incorrect code:**
```php
$reservedFromReservations = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
    ->whereNotNull('lot_id')
    ->pluck('lot_id')
    ->toArray();
```

This query returned lot IDs from ALL product types, so when viewing Family Estates, it would include lot IDs from Lawn Lots reservations.

## Solution

Updated `PropertyController.php` to filter reservations by `lot_type` to only get reservations for the specific property type being viewed.

### Changes Made

#### 1. Updated `getProperties()` method

**Before:**
```php
$reservedFromReservations = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
    ->whereNotNull('lot_id')
    ->pluck('lot_id')
    ->toArray();
```

**After:**
```php
$reservedFromReservations = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
    ->where('lot_type', $type)  // Filter by property type
    ->whereNotNull('lot_id')
    ->pluck('lot_id')
    ->toArray();
```

#### 2. Updated `getPropertyDetails()` method

**Before:**
```php
$reservation = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
    ->where('lot_id', $propertyId)
    ->first();
```

**After:**
```php
$reservation = \App\Models\Reservation::whereIn('status', ['pending', 'approved'])
    ->where('lot_type', $type)  // Filter by property type
    ->where('lot_id', $propertyId)
    ->first();
```

## How It Works Now

### Lawn Lots Selector
- Shows only reservations where `lot_type = 'lawn-lots'`
- Lot 1, 2, 3 are occupied (from lawn-lots reservations)
- Other lots are available

### Columbariums Selector
- Shows only reservations where `lot_type = 'columbariums'`
- No occupied spots (no columbariums reservations yet)
- All lots are available

### Family Estates Selector
- Shows only reservations where `lot_type = 'family-estates'`
- No occupied spots (no family-estates reservations yet)
- All lots are available

## Database Schema

The `Reservation` model stores:
- `lot_type`: The type of property ('lawn-lots', 'columbariums', 'family-estates')
- `lot_id`: The ID of the specific lot/niche/estate
- `product_id`: The product being reserved
- `status`: The reservation status (pending, approved, rejected, cancelled)

Example:
```
Reservation 1: lot_type='lawn-lots', lot_id=1, status='approved'
Reservation 2: lot_type='lawn-lots', lot_id=2, status='approved'
Reservation 3: lot_type='lawn-lots', lot_id=3, status='pending'
```

When viewing Family Estates, the query filters by `lot_type='family-estates'`, so it returns no results (no occupied spots).

## Test Scenario

**Before Fix:**
1. James purchases Lawn Lot 1 → Reservation created with lot_type='lawn-lots', lot_id=1
2. View Lawn Lots selector → Lot 1 shows as occupied ✓
3. View Family Estates selector → Lot 1 shows as occupied ✗ (WRONG)

**After Fix:**
1. James purchases Lawn Lot 1 → Reservation created with lot_type='lawn-lots', lot_id=1
2. View Lawn Lots selector → Lot 1 shows as occupied ✓
3. View Family Estates selector → Lot 1 shows as available ✓ (CORRECT)
4. View Columbariums selector → All lots show as available ✓ (CORRECT)

## Files Modified

- `app/Http/Controllers/PropertyController.php`
  - Updated `getProperties()` method to filter by lot_type
  - Updated `getPropertyDetails()` method to filter by lot_type

## Build Status

✅ **Build Successful** - No compilation errors

## Impact

✅ Each product type now has its own independent lot selector
✅ Occupied lots only appear in the correct product type selector
✅ Family Estates, Columbariums show all available lots (no cross-contamination)
✅ Prevents confusion when viewing different product types
✅ Accurate availability tracking per product type

## Related Models

- `App\Models\Reservation` - Stores lot_type field
- `App\Models\LawnLot` - Lawn lot properties
- `App\Models\Columbarium` - Columbarium properties
- `App\Models\FamilyEstate` - Family estate properties

---

**Fix Date**: April 28, 2026
**Status**: ✅ Implemented and Tested
**Build Status**: ✅ Verified
