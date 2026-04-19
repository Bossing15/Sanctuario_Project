# Authorization-Based Payment Flow - Testing Guide

## Pre-Testing Setup

### 1. Ensure Servers Are Running
```bash
# Terminal 1: Laravel Backend
php artisan serve

# Terminal 2: React Client App
npm start (in client-app directory)

# Terminal 3: React Admin App
npm start (in resources/js directory)
```

### 2. Test Accounts
- **Customer Account**: Sign up or use existing account
- **Admin Account**: 
  - Username: `admin`
  - Password: `admin123`
  - Or: Username: `john`, Password: `password123`

### 3. Database State
- Ensure migrations have run: `php artisan migrate`
- Ensure seeders have run: `php artisan db:seed`
- Verify lots are available: Check `lawn_lots`, `columbaria`, `family_estates` tables

---

## Test Scenarios

### ✅ TEST 1: Product Purchase (Auto-Approved - Available Lot)

**Objective**: Verify that purchasing a product with an available lot proceeds directly to payment

**Steps**:
1. Login as customer
2. Navigate to "Lawn Lots" page
3. Click "Buy Now" on a product
4. Select a payment plan (Monthly/Quarterly/Yearly)
5. Click "Select Lot"
6. Select an available lot (green colored)
7. Click "Confirm Selection"
8. Select a payment method (Card/GCash/GrabPay/PayMaya)
9. Click "Pay Now"

**Expected Results**:
- ✅ Lot selector modal opens
- ✅ Available lots are displayed in green
- ✅ Lot selection succeeds
- ✅ Payment methods are displayed
- ✅ Redirected to PayMongo checkout immediately
- ✅ No "pending approval" message shown
- ✅ Booking created with `authorization_status = AUTO_APPROVED`
- ✅ Payment record created with `status = pending`

**Database Verification**:
```sql
SELECT * FROM bookings WHERE id = [booking_id];
-- Should show: authorization_status = 'AUTO_APPROVED'

SELECT * FROM payments WHERE booking_id = [booking_id];
-- Should show: status = 'pending'
```

---

### ✅ TEST 2: Product Purchase (Rejected - Unavailable Lot)

**Objective**: Verify that purchasing a product with an unavailable lot is rejected

**Steps**:
1. Login as customer
2. Navigate to "Lawn Lots" page
3. Click "Buy Now" on a product
4. Select a payment plan
5. Click "Select Lot"
6. Try to select an occupied lot (gray colored)
7. Verify you cannot select it
8. Select an available lot
9. Complete the purchase (to occupy the lot)
10. Try to purchase again and select the same lot

**Expected Results**:
- ✅ Cannot click on occupied lots (gray colored)
- ✅ After first purchase, that lot becomes occupied
- ✅ When trying to select the same lot again, error appears
- ✅ Error message: "The selected lot is not available or does not exist"
- ✅ No payment created
- ✅ Booking created with `authorization_status = REJECTED`

**Database Verification**:
```sql
SELECT * FROM bookings WHERE authorization_status = 'REJECTED';
-- Should show rejected bookings

SELECT * FROM payments WHERE booking_id = [rejected_booking_id];
-- Should be empty (no payment created)
```

---

### ✅ TEST 3: Service Purchase (Auto-Approved - Linked Customer)

**Objective**: Verify that a customer linked to a plot can purchase services directly

**Steps**:
1. Login as customer with a plot assigned
2. Navigate to "Services" page
3. Click "Buy Now" on a service (e.g., Grave Maintenance)
4. Select a payment plan
5. Select a payment method
6. Click "Request Service"

**Expected Results**:
- ✅ Redirected to PayMongo checkout immediately
- ✅ No "pending approval" message
- ✅ Booking created with `authorization_status = AUTO_APPROVED`
- ✅ Payment record created with `status = pending`

**Database Verification**:
```sql
SELECT * FROM bookings WHERE service_id IS NOT NULL AND authorization_status = 'AUTO_APPROVED';
-- Should show auto-approved service bookings
```

---

### ✅ TEST 4: Service Purchase (Pending Authorization - Unlinked Customer)

**Objective**: Verify that a customer NOT linked to a plot must wait for admin approval

**Steps**:
1. Login as customer WITHOUT a plot assigned
2. Navigate to "Services" page
3. Click "Buy Now" on a service
4. Select a payment plan
5. Select a payment method
6. Click "Request Service"

**Expected Results**:
- ✅ See message: "Your request is pending approval. You will be notified once approved."
- ✅ Modal closes
- ✅ NOT redirected to PayMongo
- ✅ Booking created with `authorization_status = PENDING_AUTHORIZATION`
- ✅ NO Payment record created
- ✅ Admin can see the request in Dashboard

**Database Verification**:
```sql
SELECT * FROM bookings WHERE authorization_status = 'PENDING_AUTHORIZATION';
-- Should show pending authorization bookings

SELECT * FROM payments WHERE booking_id = [pending_booking_id];
-- Should be empty (no payment created yet)
```

---

### ✅ TEST 5: Admin Approves Pending Request

**Objective**: Verify that admin can approve pending authorization requests

**Steps**:
1. Login as admin
2. Navigate to Dashboard
3. Scroll to "Authorization Requests" section
4. Verify pending requests are displayed
5. Click "Review" on a pending request
6. Click "Approve Request"

**Expected Results**:
- ✅ Authorization Modal opens
- ✅ Request details are displayed correctly
- ✅ Customer information is shown
- ✅ Service/Product information is shown
- ✅ "Approve Request" button is available
- ✅ After clicking approve:
  - ✅ Modal closes
  - ✅ Success message shown
  - ✅ Request disappears from pending list
  - ✅ Stats update (Pending count decreases, Authorized count increases)

**Database Verification**:
```sql
SELECT * FROM bookings WHERE id = [booking_id];
-- Should show: authorization_status = 'AUTHORIZED', approved_by = [admin_id], approved_at = [timestamp]
```

---

### ✅ TEST 6: Admin Rejects Pending Request

**Objective**: Verify that admin can reject pending authorization requests with reason

**Steps**:
1. Login as admin
2. Navigate to Dashboard
3. Click "Review" on a pending request
4. Click "Reject Request"
5. Enter a rejection reason (e.g., "Customer not verified")
6. Click "Confirm Rejection"

**Expected Results**:
- ✅ Rejection form appears
- ✅ Reason textarea is displayed
- ✅ "Confirm Rejection" button is disabled until reason is entered
- ✅ After clicking confirm:
  - ✅ Modal closes
  - ✅ Success message shown
  - ✅ Request disappears from pending list
  - ✅ Stats update (Pending count decreases, Rejected count increases)

**Database Verification**:
```sql
SELECT * FROM bookings WHERE id = [booking_id];
-- Should show: authorization_status = 'REJECTED', rejection_reason = 'Customer not verified', rejected_at = [timestamp]
```

---

### ✅ TEST 7: Customer Proceeds with Payment After Approval

**Objective**: Verify that customer can proceed with payment after admin approval

**Steps**:
1. Complete TEST 5 (Admin approves request)
2. Login as customer (the one whose request was approved)
3. Navigate to "Billing & Payments" page
4. Find the approved request in "Pending Payments" section
5. Click "Pay Now"
6. Select payment method
7. Click "Pay Now"

**Expected Results**:
- ✅ Payment modal opens
- ✅ Redirected to PayMongo checkout
- ✅ Payment can be completed
- ✅ After payment:
  - ✅ Booking status updated to "Paid"
  - ✅ Payment status updated to "completed"
  - ✅ Receipt generated and displayed

**Database Verification**:
```sql
SELECT * FROM bookings WHERE id = [booking_id];
-- Should show: authorization_status = 'AUTHORIZED', status = 'Paid'

SELECT * FROM payments WHERE booking_id = [booking_id];
-- Should show: status = 'completed', paid_date = [timestamp]
```

---

### ✅ TEST 8: Authorization Stats Update Correctly

**Objective**: Verify that authorization statistics update in real-time

**Steps**:
1. Login as admin
2. Navigate to Dashboard
3. Note the current stats (Pending, Authorized, Auto-Approved, Rejected)
4. Create a new pending authorization request (TEST 4)
5. Refresh Dashboard
6. Verify Pending count increased by 1
7. Approve the request (TEST 5)
8. Refresh Dashboard
9. Verify Pending count decreased, Authorized count increased

**Expected Results**:
- ✅ Stats cards show correct counts
- ✅ Stats update after each action
- ✅ Counts match database records

**Database Verification**:
```sql
SELECT 
  COUNT(CASE WHEN authorization_status = 'PENDING_AUTHORIZATION' THEN 1 END) as pending,
  COUNT(CASE WHEN authorization_status = 'AUTHORIZED' THEN 1 END) as authorized,
  COUNT(CASE WHEN authorization_status = 'AUTO_APPROVED' THEN 1 END) as auto_approved,
  COUNT(CASE WHEN authorization_status = 'REJECTED' THEN 1 END) as rejected
FROM bookings;
-- Should match the stats displayed in Dashboard
```

---

### ✅ TEST 9: Search & Filter in Authorization Section

**Objective**: Verify that search and filter work in authorization requests

**Steps**:
1. Login as admin
2. Navigate to Dashboard → Authorization Requests
3. Create multiple pending requests with different customers
4. Type a customer name in search box
5. Verify only matching requests are displayed
6. Clear search
7. Verify all requests are displayed again

**Expected Results**:
- ✅ Search filters requests by customer name
- ✅ Search filters requests by product/service name
- ✅ Clearing search shows all requests
- ✅ Search is case-insensitive

---

### ✅ TEST 10: Authorization Modal Displays Correct Information

**Objective**: Verify that authorization modal shows all relevant information

**Steps**:
1. Login as admin
2. Navigate to Dashboard
3. Click "Review" on a pending request
4. Verify all information is displayed:
   - Request ID
   - Status badge
   - Request date/time
   - Customer name, email, phone
   - Service/Product name
   - Plan type
   - Amount

**Expected Results**:
- ✅ All information is displayed correctly
- ✅ Formatting is clear and readable
- ✅ Currency is formatted as ₱X,XXX.XX
- ✅ Dates are formatted clearly

---

## Edge Cases & Error Handling

### ✅ TEST 11: Lot Becomes Occupied During Selection

**Objective**: Verify system handles lot becoming occupied during selection

**Steps**:
1. Customer A starts selecting a lot
2. Customer B purchases the same lot
3. Customer A tries to confirm selection

**Expected Results**:
- ✅ Error message: "Lot is no longer available"
- ✅ Customer A can select a different lot
- ✅ No payment created for unavailable lot

---

### ✅ TEST 12: Admin Tries to Approve Already Approved Request

**Objective**: Verify system prevents double-approval

**Steps**:
1. Admin approves a request
2. Admin tries to approve the same request again

**Expected Results**:
- ✅ Error message: "Booking is not pending authorization"
- ✅ Request status not changed
- ✅ No duplicate approval records

---

### ✅ TEST 13: Customer Tries to Pay Without Authorization

**Objective**: Verify customer cannot pay before authorization

**Steps**:
1. Customer creates pending authorization request
2. Customer tries to manually access payment endpoint
3. Customer tries to create payment for pending booking

**Expected Results**:
- ✅ Payment creation fails
- ✅ Error message shown
- ✅ No payment record created

---

## Performance Tests

### ✅ TEST 14: Dashboard Loads with Many Authorization Requests

**Objective**: Verify dashboard performance with large number of requests

**Steps**:
1. Create 100+ pending authorization requests
2. Login as admin
3. Navigate to Dashboard
4. Measure load time
5. Scroll through requests
6. Search for requests

**Expected Results**:
- ✅ Dashboard loads within 3 seconds
- ✅ Scrolling is smooth
- ✅ Search is responsive
- ✅ No UI freezing

---

## Regression Tests

### ✅ TEST 15: Existing Payment Flow Still Works

**Objective**: Verify that existing payment flow for auto-approved products still works

**Steps**:
1. Complete a full product purchase flow
2. Verify payment is processed correctly
3. Verify receipt is generated
4. Verify booking is created with correct status

**Expected Results**:
- ✅ All existing functionality works
- ✅ No regression in payment processing
- ✅ Receipts generated correctly

---

## Test Results Summary

| Test # | Scenario | Status | Notes |
|--------|----------|--------|-------|
| 1 | Product Purchase (Auto-Approved) | ⏳ | |
| 2 | Product Purchase (Rejected) | ⏳ | |
| 3 | Service Purchase (Auto-Approved) | ⏳ | |
| 4 | Service Purchase (Pending Auth) | ⏳ | |
| 5 | Admin Approves Request | ⏳ | |
| 6 | Admin Rejects Request | ⏳ | |
| 7 | Customer Pays After Approval | ⏳ | |
| 8 | Stats Update Correctly | ⏳ | |
| 9 | Search & Filter Works | ⏳ | |
| 10 | Modal Shows Correct Info | ⏳ | |
| 11 | Lot Becomes Occupied | ⏳ | |
| 12 | Double-Approval Prevention | ⏳ | |
| 13 | Unauthorized Payment Prevention | ⏳ | |
| 14 | Performance with Many Requests | ⏳ | |
| 15 | Regression - Existing Flow | ⏳ | |

---

## Debugging Tips

### Check Authorization Status
```sql
SELECT id, authorization_status, approved_by, approved_at, rejection_reason FROM bookings ORDER BY created_at DESC LIMIT 10;
```

### Check Payment Status
```sql
SELECT id, booking_id, status, created_at FROM payments ORDER BY created_at DESC LIMIT 10;
```

### Check API Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Browser console
F12 → Console tab
```

### Common Issues

**Issue**: Authorization requests not showing in Dashboard
- **Solution**: Verify `fetchAuthorizationRequests()` is being called
- **Check**: Browser console for API errors
- **Check**: Database for pending bookings

**Issue**: Admin cannot approve request
- **Solution**: Verify admin has correct access level
- **Check**: Admin model has `access_level = 'admin'`
- **Check**: Authorization routes are not behind permission middleware

**Issue**: Customer sees "pending approval" but request doesn't appear in admin dashboard
- **Solution**: Verify booking was created with `authorization_status = PENDING_AUTHORIZATION`
- **Check**: Database query above
- **Check**: API endpoint returns correct data

---

## Sign-Off

Once all tests pass, the authorization-based payment flow is ready for production deployment.

**Tested By**: _______________
**Date**: _______________
**Notes**: _______________
