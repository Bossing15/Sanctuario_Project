# Fix: Services Should Not Ask for Purpose

## Issue
When requesting for a service (maintenance services), the system was incorrectly handling the `request_purpose` field. Services should NOT ask users to select a purpose (deceased vs reservation), only products should.

## Root Cause
The PaymentModal component was sending `request_purpose` for both products and services:
```javascript
formData.append('request_purpose', requestPurpose || 'deceased');
```

For services, `requestPurpose` was `null` (since MaintenancePage doesn't set it), so it defaulted to `'deceased'`. This was incorrect behavior.

## Solution

### 1. PaymentModal.jsx - Only Send Purpose for Products
**File**: `client-app/src/components/PaymentModal.jsx`

**Change**: Modified the `createReservation` function to only append `request_purpose` for products, not services.

**Before**:
```javascript
formData.append('request_purpose', requestPurpose || 'deceased');
```

**After**:
```javascript
// Only append request_purpose for products, not for services
if (isProduct && requestPurpose) {
  formData.append('request_purpose', requestPurpose);
}
```

### 2. ReservationController.php - Don't Default Purpose for Services
**File**: `app/Http/Controllers/ReservationController.php`

**Change**: Modified the reservation data to not default `request_purpose` to `'deceased'` for services.

**Before**:
```php
'request_purpose' => $validated['request_purpose'] ?? 'deceased',
```

**After**:
```php
'request_purpose' => $validated['request_purpose'] ?? null, // Don't default to 'deceased' - let it be null for services
```

## Flow After Fix

### Products (Lawn Lots, Columbariums, Family Estates, Cremation, Internment)
1. User clicks "Buy Now"
2. Select payment plan (Monthly/Quarterly/Yearly)
3. **Purpose Selection Modal** - Choose "Deceased Loved One" or "Reservation Only"
4. Deceased Info Modal - Enter deceased information and upload ID
5. Lot Selector - Select the specific lot
6. Payment Modal - Complete payment

### Services (Grave Cleaning, Grave Painting, Grave Restoration)
1. User clicks "Select" on a service plan
2. **Deceased Info Modal** - Enter deceased information and upload ID (NO purpose selection)
3. Payment Modal - Complete payment

## Key Differences

| Aspect | Products | Services |
|--------|----------|----------|
| Purpose Selection | ✓ Yes (Deceased/Reservation) | ✗ No |
| Deceased Info | ✓ Required | ✓ Required |
| ID Upload | ✓ Required | ✓ Required |
| Lot Selection | ✓ Required | ✗ No |
| request_purpose Field | ✓ Set to 'deceased' or 'reservation' | ✗ Null/Not sent |

## Testing

### Test Case 1: Service Request (Maintenance)
1. Navigate to Maintenance Services page
2. Click "Select" on any service plan
3. Verify: NO purpose selection modal appears
4. Verify: Goes directly to Deceased Info Modal
5. Verify: Can complete service request without selecting purpose

### Test Case 2: Product Request (Lawn Lot)
1. Navigate to Lawn Lots page
2. Click "Buy Now"
3. Select a payment plan
4. Verify: Purpose Selection Modal appears
5. Select "Deceased Loved One" or "Reservation Only"
6. Verify: Proceeds to Deceased Info Modal with correct purpose

### Test Case 3: Reservation-Only Product
1. Navigate to any product page
2. Click "Buy Now" → Select plan → Select "Reservation Only"
3. Verify: Deceased Info Modal shows only ID upload (no deceased fields)
4. Verify: Reservation is created with `request_purpose = 'reservation'`

## Database Impact
- Services will have `request_purpose = NULL` in the reservations table
- Products will have `request_purpose = 'deceased'` or `'reservation'`
- Admin interface should handle NULL values gracefully (already does)

## Files Modified
1. `client-app/src/components/PaymentModal.jsx`
2. `app/Http/Controllers/ReservationController.php`

## Status
✓ FIXED AND VERIFIED
