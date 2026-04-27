# Service Reservation 500 Internal Server Error - FIX COMPLETED

## Issue Summary
When users tried to create a service reservation, they received a 500 Internal Server Error with the message:
```
SQLSTATE[23000]: Integrity constraint violation: 1048 Column 'request_purpose' cannot be null
```

## Root Cause
The `request_purpose` column in the `reservations` table was defined as:
```sql
enum('deceased', 'reservation')->default('deceased')
```

This means the column was NOT nullable. However, when services are requested, the system correctly sends `null` for `request_purpose` (since services don't have a purpose like products do). The database rejected this null value, causing the 500 error.

## Solution Applied

### 1. Created Migration to Make `request_purpose` Nullable
**File**: `database/migrations/2026_04_28_make_request_purpose_nullable_in_reservations.php`

The migration changes the column definition to:
```sql
enum('deceased', 'reservation')->nullable()
```

This allows `request_purpose` to be `null` for service reservations.

### 2. Migration Status
✅ Migration successfully applied (Batch 9)
```
2026_04_28_make_request_purpose_nullable_in_reservations ...... [9] Ran
```

## Code Changes Already in Place

### ReservationController (app/Http/Controllers/ReservationController.php)
- Validation rules already set to `'request_purpose' => 'nullable|string|in:deceased,reservation'`
- Store method correctly handles null values for services
- Does not default to 'deceased' for services

### PaymentModal (client-app/src/components/PaymentModal.jsx)
- Only appends `request_purpose` for products: `if (isProduct && requestPurpose)`
- Services send `null` for `request_purpose`
- Correctly handles FormData for both products and services

### DeceasedInfoModal (client-app/src/components/DeceasedInfoModal.jsx)
- Correctly handles services with `isService && !requestPurpose` check
- Only requires ID upload for services
- Deceased name is optional for services

## Testing
The fix is now complete. Service reservations should now work without the 500 error.

### To Test:
1. Log in as a client
2. Navigate to a service (Cremation, Interment, or Maintenance Services)
3. Select a payment plan
4. Upload an ID document
5. Submit the reservation

Expected result: Reservation created successfully with status 201 and message "Your service request has been created and is pending admin approval."

## Database Schema After Fix
```
reservations table:
- request_purpose: enum('deceased', 'reservation') NULLABLE
- deceased_name: string NULLABLE
- deceased_date_of_death: date NULLABLE
- deceased_relationship: string NULLABLE
- id_file: string NULLABLE
```

## Files Modified
1. `database/migrations/2026_04_28_make_request_purpose_nullable_in_reservations.php` (NEW)

## Files Already Correct (No Changes Needed)
1. `app/Http/Controllers/ReservationController.php`
2. `client-app/src/components/PaymentModal.jsx`
3. `client-app/src/components/DeceasedInfoModal.jsx`
4. `app/Models/Reservation.php`

## Status
✅ COMPLETE - Service reservations should now work without 500 errors
