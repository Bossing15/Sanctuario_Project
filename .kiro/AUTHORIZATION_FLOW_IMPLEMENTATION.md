# Authorization-Based Payment Flow Implementation

## Overview
This document describes the implementation of an authorization-first workflow for the cemetery management system, separating validation (admin-controlled) from payment processing.

---

## System Architecture

### 1. **Authorization Determination Logic** (`AuthorizationService`)

The system automatically determines whether a transaction requires admin authorization:

#### For PRODUCTS (Lawn Lots, Columbariums, Family Estates):
- **AUTO_APPROVED**: If the selected lot is available (not occupied)
- **REJECTED**: If the lot is unavailable or doesn't exist

#### For SERVICES (Grave Maintenance, Cremation, etc.):
- **AUTO_APPROVED**: If customer is linked to the plot (plot_number matches or customer owns the grave)
- **PENDING_AUTHORIZATION**: If customer is NOT linked to the plot or plot doesn't exist
- **REJECTED**: Never (services always go to pending or auto-approved)

---

## Database Schema Changes

### New Fields in `bookings` Table:
```sql
- authorization_status (enum): AUTO_APPROVED, PENDING_AUTHORIZATION, AUTHORIZED, REJECTED
- approved_by (foreign key): References admin who approved the request
- approved_at (timestamp): When the request was approved
- rejection_reason (text): Reason for rejection (if rejected)
- rejected_at (timestamp): When the request was rejected
```

---

## Payment Flow

### **AUTO_APPROVED Transactions** (Products with available lots)

```
1. Customer selects product + lot + payment plan
   ↓
2. Frontend sends checkout request
   ↓
3. Backend creates Booking with authorization_status = AUTO_APPROVED
   ↓
4. Backend creates Payment record (status: pending)
   ↓
5. Backend creates PayMongo checkout session
   ↓
6. Frontend redirects to PayMongo
   ↓
7. Customer completes payment
   ↓
8. Payment status → completed
   ↓
9. Booking status → Paid
   ↓
10. Receipt generated
```

### **PENDING_AUTHORIZATION Transactions** (Services without customer-plot link)

```
1. Customer selects service + payment plan
   ↓
2. Frontend sends checkout request
   ↓
3. Backend creates Booking with authorization_status = PENDING_AUTHORIZATION
   ↓
4. Backend returns 202 response with message:
   "Your request is pending approval. You will be notified once approved."
   ↓
5. NO Payment record created yet
   ↓
6. NO PayMongo checkout session created
   ↓
7. Admin reviews request in Dashboard
   ↓
8. Admin approves → authorization_status = AUTHORIZED
   ↓
9. Customer receives notification
   ↓
10. Customer can now proceed with payment
    ↓
11. Frontend sends payment request
    ↓
12. Backend creates Payment + PayMongo session
    ↓
13. Customer completes payment
```

### **REJECTED Transactions** (Products with unavailable lots)

```
1. Customer selects product + unavailable lot
   ↓
2. Frontend sends checkout request
   ↓
3. Backend creates Booking with authorization_status = REJECTED
   ↓
4. Backend returns 400 error:
   "The selected lot is not available or does not exist"
   ↓
5. NO Payment record created
   ↓
6. Customer sees error message
```

---

## Admin Dashboard - Authorization Section

### Features:
1. **Authorization Stats Cards**:
   - Pending Approval count
   - Authorized count
   - Auto-Approved count
   - Rejected count

2. **Pending Requests Table**:
   - Request ID
   - Customer name & contact
   - Product/Service type
   - Amount
   - Request date
   - Status badge
   - Review button

3. **Search & Filter**:
   - Search by customer name or product
   - Filter by status (if needed)

4. **Admin Actions** (via Review button):
   - Approve request → authorization_status = AUTHORIZED
   - Reject request → authorization_status = REJECTED (with reason)

---

## API Endpoints

### Authorization Management:
```
GET  /api/bookings/authorization/pending
     - Get all pending authorization requests
     - Returns: array of booking requests with customer details

GET  /api/bookings/authorization/stats
     - Get authorization statistics
     - Returns: { pending, authorized, auto_approved, rejected }

POST /api/bookings/authorization/{bookingId}/approve
     - Approve a booking request
     - Body: (empty)
     - Returns: updated booking with authorization_status = AUTHORIZED

POST /api/bookings/authorization/{bookingId}/reject
     - Reject a booking request
     - Body: { reason: "string" }
     - Returns: updated booking with authorization_status = REJECTED
```

### Payment Checkout (Updated):
```
POST /api/payments/create-checkout-public
     - Create checkout session
     - Returns:
       * If AUTO_APPROVED: { checkout_url, payment_id, session_id }
       * If PENDING_AUTHORIZATION: { status: "pending_authorization", booking_id }
       * If REJECTED: { status: "rejected", reason: "..." }
```

---

## Frontend Integration

### Customer Experience:

1. **For Products (Auto-Approved)**:
   - Select lot → Select payment plan → Select payment method → Pay Now
   - Redirected to PayMongo immediately
   - Receipt generated after payment

2. **For Services (Pending Authorization)**:
   - Select service → Select payment plan → Click "Request Service"
   - See message: "Your request is pending approval. You will be notified once approved."
   - Wait for admin approval
   - Once approved, receive notification
   - Can then proceed with payment

### Admin Experience:

1. **Dashboard Authorization Section**:
   - View all pending requests
   - See customer details, product/service, amount
   - Click "Review" button
   - Modal opens with approve/reject options
   - Approve → Customer notified, can proceed with payment
   - Reject → Customer notified with reason

---

## Key Benefits

1. **Validation Before Payment**: Services are validated before payment is initiated
2. **Reduced Refunds**: Invalid requests are caught before payment processing
3. **Centralized Control**: All authorization decisions go through admin dashboard
4. **Smooth UX**: Auto-approved transactions proceed immediately; pending ones show clear messaging
5. **Audit Trail**: All approvals/rejections tracked with admin name and timestamp
6. **Scalability**: Easy to add more authorization rules in AuthorizationService

---

## Implementation Files

### Backend:
- `app/Services/AuthorizationService.php` - Authorization logic
- `app/Http/Controllers/BookingAuthorizationController.php` - Admin approval endpoints
- `app/Http/Controllers/PaymentController.php` - Updated checkout logic
- `app/Models/Booking.php` - Updated with new fields
- `database/migrations/2026_04_19_115431_add_authorization_fields_to_bookings_table.php` - Schema changes
- `routes/api.php` - New authorization routes

### Frontend:
- `resources/js/src/Components/Dashboard.jsx` - Authorization section added
- `client-app/src/components/PaymentModal.jsx` - Handle pending authorization response

---

## Testing Scenarios

### Scenario 1: Product Purchase (Auto-Approved)
1. Login as customer
2. Browse lawn lots
3. Click "Buy Now" on a product
4. Select available lot
5. Select payment plan & method
6. Click "Pay Now"
7. ✅ Redirected to PayMongo immediately

### Scenario 2: Service Purchase (Pending Authorization)
1. Login as customer
2. Browse services
3. Click "Buy Now" on a service
4. Select payment plan & method
5. Click "Request Service"
6. ✅ See "pending approval" message
7. Login as admin
8. Go to Dashboard → Authorization Requests
9. Click "Review" on the request
10. Click "Approve"
11. ✅ Customer receives notification
12. Customer can now proceed with payment

### Scenario 3: Product Purchase (Rejected - Unavailable Lot)
1. Login as customer
2. Browse lawn lots
3. Click "Buy Now" on a product
4. Select an already-occupied lot
5. Select payment plan & method
6. Click "Pay Now"
7. ✅ See error: "The selected lot is not available"

---

## Future Enhancements

1. **Email Notifications**: Send emails when requests are approved/rejected
2. **SMS Notifications**: Send SMS to customers
3. **Bulk Approval**: Admin can approve multiple requests at once
4. **Custom Rules**: Add more complex authorization rules
5. **Audit Logs**: Detailed logging of all authorization decisions
6. **Scheduled Payments**: Auto-process payments after approval
7. **Payment Reminders**: Remind customers to complete payment after approval
