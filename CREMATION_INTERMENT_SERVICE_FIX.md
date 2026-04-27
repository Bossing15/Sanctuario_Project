# Fix: Cremation and Interment Should Not Ask for Purpose

## Issue
When requesting for Cremation or Interment services, the system was incorrectly asking users to select a purpose (Deceased vs Reservation). Services should NOT ask for purpose selection - only products should.

## Root Cause
CremationPage and InternmentPage were treating these services like products by:
1. Showing PurposeSelectionModal after plan selection
2. Passing `requestPurpose` to DeceasedInfoModal
3. Including purpose selection in the flow

However, Cremation and Interment are services (fetched from `/api/public/services`), not products. They should follow the same flow as MaintenancePage and other services.

## Solution

### 1. CremationPage.jsx
**Changes**:
- Removed import of `PurposeSelectionModal`
- Removed `showPurposeModal` state
- Removed `requestPurpose` state
- Removed `handleSelectPurpose()` method
- Modified `handleSelectPlan()` to skip purpose selection and go directly to DeceasedInfoModal
- Updated `handleClosePaymentModal()` to not reset `requestPurpose`
- Updated PaymentModal props to not pass `requestPurpose`
- Updated DeceasedInfoModal props to pass `requestPurpose={null}`

**Flow Before**:
```
Select Plan → Purpose Selection → Deceased Info → Payment
```

**Flow After**:
```
Select Plan → Deceased Info → Payment
```

### 2. InternmentPage.jsx
**Changes**:
- Same changes as CremationPage
- Removed import of `PurposeSelectionModal`
- Removed `showPurposeModal` state
- Removed `requestPurpose` state
- Removed `handleSelectPurpose()` method
- Modified `handleSelectPlan()` to skip purpose selection
- Updated all related props and state management

## Consistent Service Flow

All services now follow the same flow:
1. **MaintenancePage** (Grave Cleaning, Painting, Restoration)
   - Select Plan → Deceased Info → Payment ✓

2. **CremationPage** (Cremation Service)
   - Select Plan → Deceased Info → Payment ✓

3. **InternmentPage** (Interment Service)
   - Select Plan → Deceased Info → Payment ✓

## Product Flow (Unchanged)

Products still ask for purpose:
1. **LawnLotsPage** (Lawn Lots Product)
   - Select Plan → Purpose Selection → Deceased Info → Lot Selection → Payment ✓

2. **ColumbariumsPage** (Columbariums Product)
   - Select Plan → Purpose Selection → Deceased Info → Lot Selection → Payment ✓

3. **FamilyEstatesPage** (Family Estates Product)
   - Select Plan → Purpose Selection → Deceased Info → Lot Selection → Payment ✓

## Files Modified
1. `client-app/src/pages/CremationPage.jsx`
2. `client-app/src/pages/InternmentPage.jsx`

## Testing

### Test Case 1: Cremation Service
1. Navigate to Cremation page
2. Click "Request Now"
3. Select a payment plan
4. Verify: NO purpose selection modal appears
5. Verify: Goes directly to Deceased Info Modal
6. Verify: Can complete service request without selecting purpose

### Test Case 2: Interment Service
1. Navigate to Interment page
2. Click "Request Now"
3. Select a payment plan
4. Verify: NO purpose selection modal appears
5. Verify: Goes directly to Deceased Info Modal
6. Verify: Can complete service request without selecting purpose

### Test Case 3: Product (Lawn Lots)
1. Navigate to Lawn Lots page
2. Click "Buy Now"
3. Select a payment plan
4. Verify: Purpose Selection Modal appears
5. Select "Deceased Loved One" or "Reservation Only"
6. Verify: Proceeds to Deceased Info Modal with correct purpose

## Backend Impact
- No backend changes required
- Services will have `request_purpose = NULL` in the reservations table
- Products will have `request_purpose = 'deceased'` or `'reservation'`

## Status
✓ FIXED AND VERIFIED

Cremation and Interment services now correctly skip the purpose selection step and go directly to deceased information collection.
