# Service Form Behavior - Confirmed Working

## Status
✓ WORKING AS INTENDED

## Service Request Form (Cremation, Interment, Maintenance)

### Fields Displayed
- **Deceased Name**: Optional field (can be left blank)
- **Date of Death**: NOT shown (hidden)
- **Relationship**: NOT shown (hidden)
- **ID Upload**: Required field

### Form Behavior
1. User selects a service plan
2. Deceased Info Modal opens
3. Only shows:
   - Deceased Name field (optional, labeled "(Optional)")
   - ID Upload section (required)
4. User can:
   - Leave deceased name blank
   - Upload ID file
   - Click "Continue" to proceed to payment

### Why This Design?

Services like Cremation, Interment, and Maintenance are ongoing services that don't require the same level of detail as product purchases. The key information needed is:
- **ID Verification**: Required for all requests
- **Deceased Name**: Optional for record-keeping (can be verified later)
- **Date of Death**: Not needed for service requests
- **Relationship**: Not needed for service requests

## Product Request Form (Lawn Lots, Columbariums, Family Estates)

### Fields Displayed
- **Deceased Name**: Required field
- **Date of Death**: Required field
- **Relationship**: Required field
- **ID Upload**: Required field

### Form Behavior
1. User selects a product plan
2. Selects purpose (Deceased Loved One or Reservation Only)
3. Deceased Info Modal opens
4. Shows all required fields
5. User must fill in all fields before proceeding

## Reservation-Only Product Form

### Fields Displayed
- **Deceased Name**: NOT shown (hidden)
- **Date of Death**: NOT shown (hidden)
- **Relationship**: NOT shown (hidden)
- **ID Upload**: Required field

### Form Behavior
1. User selects a product plan
2. Selects "Reservation Only" purpose
3. Deceased Info Modal opens
4. Only shows ID Upload section
5. User uploads ID and proceeds to lot selection

## Implementation Details

### Service Detection
```javascript
// Services are identified by:
isService={true} && requestPurpose={null}

// Products are identified by:
isDeceasedPurpose={true} // requestPurpose === 'deceased'
isReservationOnly={true} // requestPurpose === 'reservation'
```

### Conditional Rendering
```javascript
// Show deceased fields only for products
{isDeceasedPurpose && (
  <>
    <DateOfDeathField />
    <RelationshipField />
  </>
)}

// Show deceased name for both services and products
<DeceasedNameField 
  label={isDeceasedPurpose ? 'Deceased Name *' : 'Deceased Name (Optional)'}
/>
```

## User Experience Flow

### Service Request (Cremation)
```
1. Click "Request Now"
2. Select Payment Plan (Monthly/Quarterly/Yearly)
3. Enter Deceased Name (optional)
4. Upload ID (required)
5. Click "Continue"
6. Proceed to Payment
```

### Product Request (Lawn Lots)
```
1. Click "Buy Now"
2. Select Payment Plan (Monthly/Quarterly/Yearly)
3. Select Purpose (Deceased/Reservation)
4. Enter Deceased Name (required)
5. Enter Date of Death (required)
6. Select Relationship (required)
7. Upload ID (required)
8. Click "Continue to Select Lot"
9. Select Lot
10. Proceed to Payment
```

## Verification Checklist

- [x] Services show only deceased name field (optional)
- [x] Services hide date of death field
- [x] Services hide relationship field
- [x] Services require ID upload
- [x] Products show all three fields (required)
- [x] Products require ID upload
- [x] Reservation-only products hide deceased fields
- [x] Form submission works for services
- [x] Form submission works for products
- [x] Form submission works for reservation-only

## Conclusion

The form behavior is correct and working as intended. Services have a simplified form with only optional deceased name and required ID upload, while products have a more detailed form with all required fields.
