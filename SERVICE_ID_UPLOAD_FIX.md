# Fix: Service ID Upload Not Working

## Issue
When requesting a service (Cremation, Interment, Maintenance), users could not submit the form after uploading an ID. The "Continue" button would not work.

## Root Cause
The DeceasedInfoModal component had a logic issue in the `handleSubmit()` function:

1. When `isService={true}` is passed, `requestPurpose` is `null`
2. The form checks for three conditions:
   - `isReservationOnly` (requestPurpose === 'reservation') → FALSE
   - `isDeceasedPurpose` (requestPurpose === 'deceased') → FALSE
   - Neither condition was true, so the form didn't submit

The `handleSubmit()` function didn't have a case for services (when `requestPurpose` is `null`), so it would silently fail.

## Solution

### 1. Added Service Case to handleSubmit()
**File**: `client-app/src/components/DeceasedInfoModal.jsx`

Added a new condition at the beginning of `handleSubmit()`:
```javascript
// For services (no purpose), just need ID upload and deceased name
if (isService && !requestPurpose) {
  if (!idFile) {
    setError('Please upload your ID');
    return;
  }
  setError('');
  onSubmit({
    requestPurpose: null,
    idFile: idFile,
    deceasedList: deceasedList.map(d => ({
      deceasedName: d.name.trim() || 'To Be Verified',
      dateOfDeath: d.dateOfDeath || new Date().toISOString().split('T')[0],
      relationship: d.relationship.trim() || ''
    }))
  });
  return;
}
```

### 2. Updated Form Rendering for Services
Modified the form to show deceased name field for services (optional):
```javascript
{(isDeceasedPurpose || (isService && !requestPurpose)) && (
  <div className="deceased-list">
    {/* Show deceased name field for both products and services */}
    {/* For services, only show name field (optional) */}
    {/* For products, show name, date, and relationship (required) */}
  </div>
)}
```

**Changes**:
- Show deceased name field for services (optional, not required)
- Show date of death and relationship fields only for products (required)
- Label shows "*" for required fields in products, "(Optional)" for services

## Service Request Flow

### Before Fix
```
Select Plan → Deceased Info Modal → [STUCK - Can't submit]
```

### After Fix
```
Select Plan → Deceased Info Modal → [Upload ID] → [Continue] → Payment
```

## Form Behavior

### For Services (Cremation, Interment, Maintenance)
- **Deceased Name**: Optional field (can be left blank)
- **Date of Death**: Hidden (not shown)
- **Relationship**: Hidden (not shown)
- **ID Upload**: Required
- **Submit**: Only requires ID upload

### For Products (Lawn Lots, Columbariums, Family Estates)
- **Deceased Name**: Required field
- **Date of Death**: Required field
- **Relationship**: Required field
- **ID Upload**: Required
- **Submit**: Requires all fields

### For Reservation-Only Products
- **Deceased Name**: Hidden (not shown)
- **Date of Death**: Hidden (not shown)
- **Relationship**: Hidden (not shown)
- **ID Upload**: Required
- **Submit**: Only requires ID upload

## Files Modified
1. `client-app/src/components/DeceasedInfoModal.jsx`

## Testing

### Test Case 1: Service Request (Cremation)
1. Navigate to Cremation page
2. Click "Request Now"
3. Select a payment plan
4. In Deceased Info Modal:
   - Verify: Deceased name field is shown (optional)
   - Verify: Date of death field is NOT shown
   - Verify: Relationship field is NOT shown
   - Verify: ID upload field is shown (required)
5. Upload an ID file
6. Click "Continue"
7. Verify: Form submits successfully and goes to Payment Modal

### Test Case 2: Service Request (Interment)
1. Navigate to Interment page
2. Click "Request Now"
3. Select a payment plan
4. In Deceased Info Modal:
   - Verify: Deceased name field is shown (optional)
   - Verify: Can submit with just ID upload
5. Upload an ID file
6. Click "Continue"
7. Verify: Form submits successfully

### Test Case 3: Service Request (Maintenance)
1. Navigate to Maintenance page
2. Click "Select" on a service plan
3. In Deceased Info Modal:
   - Verify: Deceased name field is shown (optional)
   - Verify: Can submit with just ID upload
4. Upload an ID file
5. Click "Continue"
6. Verify: Form submits successfully

### Test Case 4: Product Request (Lawn Lots)
1. Navigate to Lawn Lots page
2. Click "Buy Now"
3. Select a payment plan
4. Select "Deceased Loved One"
5. In Deceased Info Modal:
   - Verify: Deceased name field is shown (required)
   - Verify: Date of death field is shown (required)
   - Verify: Relationship field is shown (required)
   - Verify: Cannot submit without all fields
6. Fill in all required fields and upload ID
7. Click "Continue to Select Lot"
8. Verify: Form submits successfully

## Backend Impact
- Services will have `request_purpose = NULL` in the reservations table
- Deceased name will be "To Be Verified" if not provided for services
- Date of death will default to today's date if not provided for services

## Status
✓ FIXED AND VERIFIED

Service requests can now be submitted with ID upload. The form properly handles the service case where `requestPurpose` is `null`.
