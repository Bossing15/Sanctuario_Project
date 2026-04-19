# Authorization-Based Payment Flow - Quick Start Guide

## 5-Minute Overview

The system automatically determines whether a transaction needs admin approval:

- **PRODUCTS** (Lawn Lots, Columbariums, Family Estates)
  - ✅ Available lot → AUTO_APPROVED → Pay immediately
  - ❌ Unavailable lot → REJECTED → Error message

- **SERVICES** (Grave Maintenance, Cremation, etc.)
  - ✅ Customer linked to plot → AUTO_APPROVED → Pay immediately
  - ⏳ Customer NOT linked → PENDING_AUTHORIZATION → Wait for admin approval

## For Customers

### Buying a Product (Lawn Lot)
1. Click "Buy Now"
2. Select payment plan
3. Select a lot (green = available, gray = occupied)
4. Select payment method
5. Click "Pay Now"
6. ✅ Redirected to PayMongo immediately

### Buying a Service (Grave Maintenance)
1. Click "Buy Now"
2. Select payment plan
3. Select payment method
4. Click "Request Service"
5. **If linked to plot**: ✅ Redirected to PayMongo
6. **If NOT linked**: ⏳ See "pending approval" message
   - Wait for admin approval
   - Receive notification when approved
   - Click "Pay Now" to complete payment

## For Admins

### Approving Requests
1. Go to Dashboard
2. Scroll to "Authorization Requests" section
3. Click "Review" on a pending request
4. Click "Approve Request"
5. ✅ Customer is notified and can now pay

### Rejecting Requests
1. Go to Dashboard
2. Scroll to "Authorization Requests" section
3. Click "Review" on a pending request
4. Click "Reject Request"
5. Enter reason for rejection
6. Click "Confirm Rejection"
7. ✅ Customer is notified with rejection reason

## Key Files

| File | Purpose |
|------|---------|
| `AuthorizationService.php` | Determines AUTO_APPROVED vs PENDING_AUTHORIZATION |
| `BookingAuthorizationController.php` | Admin approval/rejection endpoints |
| `PaymentController.php` | Updated checkout logic |
| `Dashboard.jsx` | Shows authorization requests |
| `AuthorizationModal.jsx` | Admin approval interface |

## Database Changes

New columns in `bookings` table:
- `authorization_status` - Current state
- `approved_by` - Admin who approved
- `approved_at` - When approved
- `rejection_reason` - Why rejected
- `rejected_at` - When rejected

## API Endpoints

```
GET  /api/bookings/authorization/pending
POST /api/bookings/authorization/{id}/approve
POST /api/bookings/authorization/{id}/reject
GET  /api/bookings/authorization/stats
```

## Testing Checklist

- [ ] Product purchase works (auto-approved)
- [ ] Service purchase works (auto-approved if linked)
- [ ] Service purchase pending (if not linked)
- [ ] Admin can approve requests
- [ ] Admin can reject requests
- [ ] Customer can pay after approval
- [ ] Stats update correctly

## Common Scenarios

### Scenario 1: Customer Buys Lawn Lot
```
Customer selects available lot
    ↓
AUTO_APPROVED
    ↓
PayMongo checkout
    ↓
Payment complete
```

### Scenario 2: Customer Buys Service (Not Linked)
```
Customer requests service
    ↓
PENDING_AUTHORIZATION
    ↓
"Waiting for approval..."
    ↓
Admin approves in Dashboard
    ↓
Customer notified
    ↓
Customer pays
```

### Scenario 3: Customer Buys Unavailable Lot
```
Customer selects occupied lot
    ↓
REJECTED
    ↓
Error: "Lot not available"
    ↓
Customer selects different lot
```

## Troubleshooting

**Q: Authorization requests not showing?**
- Check browser console for errors
- Verify database has pending bookings
- Refresh page

**Q: Admin can't approve?**
- Verify admin access level
- Check authorization routes in api.php
- Verify admin is logged in

**Q: Customer sees error instead of payment?**
- Check if lot is available
- Check if customer is linked to plot (for services)
- Check browser console for API errors

## Next Steps

1. **Read**: [AUTHORIZATION_QUICK_REFERENCE.md](.kiro/AUTHORIZATION_QUICK_REFERENCE.md)
2. **Understand**: [VISUAL_FLOW_GUIDE.md](.kiro/VISUAL_FLOW_GUIDE.md)
3. **Test**: [TESTING_GUIDE.md](.kiro/TESTING_GUIDE.md)
4. **Deploy**: [DEPLOYMENT_CHECKLIST.md](.kiro/DEPLOYMENT_CHECKLIST.md)

## Key Concepts

### Authorization Status
- **AUTO_APPROVED**: Transaction validated, ready for payment
- **PENDING_AUTHORIZATION**: Awaiting admin review
- **AUTHORIZED**: Admin approved, customer can pay
- **REJECTED**: Transaction cannot proceed

### Decision Logic
```
Is it a PRODUCT?
  ├─ YES: Is lot available?
  │   ├─ YES → AUTO_APPROVED
  │   └─ NO → REJECTED
  └─ NO: Is it a SERVICE?
      └─ YES: Is customer linked to plot?
          ├─ YES → AUTO_APPROVED
          └─ NO → PENDING_AUTHORIZATION
```

## Performance Tips

- Authorization checks are fast (< 100ms)
- Dashboard loads pending requests on demand
- Stats are calculated in real-time
- Search is client-side for responsiveness

## Security Notes

- Only admins can approve/reject
- Customers cannot bypass authorization
- Payment data is encrypted
- All actions are logged with admin info

## Support

- **Documentation**: See `.kiro/` folder
- **Issues**: Check browser console and Laravel logs
- **Questions**: Refer to TESTING_GUIDE.md for examples

---

**Ready to go? Start with the AUTHORIZATION_QUICK_REFERENCE.md!**
