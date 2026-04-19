# Authorization Flow - Quick Reference

## Decision Tree

```
Customer initiates purchase
    ↓
Is it a PRODUCT (Lawn Lot, Columbarium, Family Estate)?
    ├─ YES → Is the lot available?
    │   ├─ YES → AUTO_APPROVED ✅ (proceed to payment immediately)
    │   └─ NO → REJECTED ❌ (show error, no payment)
    │
    └─ NO → Is it a SERVICE?
        └─ YES → Is customer linked to the plot?
            ├─ YES → AUTO_APPROVED ✅ (proceed to payment immediately)
            └─ NO → PENDING_AUTHORIZATION ⏳ (wait for admin approval)
```

---

## Status Meanings

| Status | Meaning | Next Step |
|--------|---------|-----------|
| **AUTO_APPROVED** | Transaction validated, ready for payment | Create PayMongo session immediately |
| **PENDING_AUTHORIZATION** | Awaiting admin review | Admin reviews in Dashboard, approves/rejects |
| **AUTHORIZED** | Admin approved the request | Customer can now proceed with payment |
| **REJECTED** | Transaction cannot proceed | Show error to customer, no payment |

---

## Customer Flows

### Flow 1: Product Purchase (Lawn Lot)
```
Browse → Select Lot → Select Plan → Select Payment Method → Pay Now
                                                              ↓
                                                    AUTO_APPROVED
                                                              ↓
                                                    PayMongo Checkout
                                                              ↓
                                                    Payment Complete
```

### Flow 2: Service Purchase (Grave Maintenance)
```
Browse → Select Plan → Select Payment Method → Request Service
                                                      ↓
                                        PENDING_AUTHORIZATION
                                                      ↓
                                    "Waiting for approval..."
                                                      ↓
                                    [Admin approves in Dashboard]
                                                      ↓
                                    Customer gets notification
                                                      ↓
                                    Customer proceeds with payment
                                                      ↓
                                    PayMongo Checkout
                                                      ↓
                                    Payment Complete
```

---

## Admin Dashboard - Authorization Section

### What You See:
- **Stats Cards**: Pending, Authorized, Auto-Approved, Rejected counts
- **Requests Table**: All pending requests with customer info
- **Review Button**: Click to approve/reject each request

### What You Do:
1. Click "Review" on a pending request
2. See customer details, product/service, amount
3. Click "Approve" or "Reject"
4. If rejecting, enter reason
5. Customer is notified automatically

---

## API Response Examples

### AUTO_APPROVED Response (201):
```json
{
  "message": "Checkout session created",
  "payment_id": 123,
  "session_id": "sess_xxx",
  "checkout_url": "https://paymongo.com/checkout/...",
  "status": "success"
}
```

### PENDING_AUTHORIZATION Response (202):
```json
{
  "message": "Your request is pending approval",
  "status": "pending_authorization",
  "booking_id": 456,
  "authorization_status": "PENDING_AUTHORIZATION",
  "notification": "Your request is pending approval. You will be notified once approved."
}
```

### REJECTED Response (400):
```json
{
  "message": "Transaction cannot be processed",
  "status": "rejected",
  "reason": "The selected lot is not available or does not exist"
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `AuthorizationService.php` | Determines AUTO_APPROVED vs PENDING_AUTHORIZATION |
| `BookingAuthorizationController.php` | Admin approval/rejection endpoints |
| `PaymentController.php` | Updated to check authorization before payment |
| `Dashboard.jsx` | Shows authorization requests section |
| `Booking.php` | Model with new authorization fields |

---

## Testing Checklist

- [ ] Product purchase with available lot → AUTO_APPROVED → Payment works
- [ ] Product purchase with unavailable lot → REJECTED → Error shown
- [ ] Service purchase by linked customer → AUTO_APPROVED → Payment works
- [ ] Service purchase by unlinked customer → PENDING_AUTHORIZATION → Waiting message
- [ ] Admin approves pending request → Customer can now pay
- [ ] Admin rejects pending request → Customer sees rejection reason
- [ ] Authorization stats update correctly
- [ ] Search/filter in authorization section works
