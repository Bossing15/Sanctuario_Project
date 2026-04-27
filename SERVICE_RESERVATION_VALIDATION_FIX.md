# Fix: Service Reservation Validation Error (500 Internal Server Error)

## Issue
When requesting a service (Cremation, Interment, Maintenance), the form submission failed with a 500 Internal Server Error. The error message was "Failed to create reservation".

## Root Cause
The ReservationController's `store()` method had validation rules that were too strict for services:

```php
'deceased_name' => 'required|string|max:255',
'deceased_date_of_death' => 'required|date|before_or_equal:today',
```

These fields were marked as **required**, but for services:
- `deceased_name` is optional (user can leave it blank)
- `deceased_date_of_death` is optional (not needed for services)

When the frontend sent these fields as optional/null for services, the validation failed because the backend expected them to be required.

## Solution

### Changed Validation Rules
**File**: `app/Http/Controllers/ReservationController.php`

**Before**:
```php
'deceased_name' => 'required|string|max:255',
'deceased_date_of_death' => 'required|date|before_or_equal:today',
```

**After**:
```php
'deceased_name' => 'nullable|string|max:255',
'deceased_date_of_death' => 'nullable|date|before_or_equal:today',
```

### Updated Data Assignment
**Before**:
```php
'deceased_name' => $validated['deceased_name'],
'deceased_date_of_death' => $validated['deceased_date_of_death'],
```

**After**:
```php
'deceased_name' => $validated['deceased_name'] ?? null,
'deceased_date_of_death' => $validated['deceased_date_of_death'] ?? null,
```

## Validation Rules by Request Type

### Service Requests (Cremation, Interment, Maintenance)
- `deceased_name`: Optional (nullable)
- `deceased_date_of_death`: Optional (nullable)
- `deceased_relationship`: Optional (nullable)
- `id_file`: Required
- `service_id`: Required
- `amount`: Required

### Product Requests (Lawn Lots, Columbariums, Family Estates)
- `deceased_name`: Optional (nullable) - but frontend enforces as required
- `deceased_date_of_death`: Optional (nullable) - but frontend enforces as required
- `deceased_relationship`: Optional (nullable)
- `id_file`: Required
- `product_id`: Required
- `lot_id`: Required (for lot selection)
- `amount`: Required

### Reservation-Only Product Requests
- `deceased_name`: Optional (nullable)
- `deceased_date_of_death`: Optional (nullable)
- `deceased_relationship`: Optional (nullable)
- `id_file`: Required
- `product_id`: Required
- `amount`: Required

## Database Impact
- Services will have `deceased_name = NULL` if not provided
- Services will have `deceased_date_of_death = NULL` if not provided
- Products will have these fields populated (frontend enforces)
- Reservation-only products will have these fields as NULL

## Testing

### Test Case 1: Service Request (Cremation)
1. Navigate to Cremation page
2. Click "Request Now"
3. Select a payment plan
4. In Deceased Info Modal:
   - Leave deceased name blank (optional)
   - Upload ID file
5. Click "Continue"
6. Verify: Reservation is created successfully
7. Verify: Proceeds to Payment Modal

### Test Case 2: Service Request (Interment)
1. Navigate to Interment page
2. Click "Request Now"
3. Select a payment plan
4. In Deceased Info Modal:
   - Leave deceased name blank
   - Upload ID file
5. Click "Continue"
6. Verify: Reservation is created successfully

### Test Case 3: Service Request with Deceased Name
1. Navigate to Maintenance page
2. Click "Select" on a service plan
3. In Deceased Info Modal:
   - Enter deceased name (optional)
   - Upload ID file
4. Click "Continue"
5. Verify: Reservation is created with deceased name

### Test Case 4: Product Request (Lawn Lots)
1. Navigate to Lawn Lots page
2. Click "Buy Now"
3. Select a payment plan
4. Select "Deceased Loved One"
5. In Deceased Info Modal:
   - Enter deceased name (required)
   - Enter date of death (required)
   - Select relationship (required)
   - Upload ID file
6. Click "Continue to Select Lot"
7. Verify: Reservation is created successfully

## Files Modified
1. `app/Http/Controllers/ReservationController.php`

## Status
✓ FIXED AND VERIFIED

Service reservations can now be created successfully with optional deceased information and required ID upload.
