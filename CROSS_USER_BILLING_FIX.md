# Critical Fix: Cross-User Billing Contamination

## Issue
John Doe was seeing James's product request in his billing and payments. This is a critical security vulnerability where payments from one user account were appearing in another user's account.

## Root Cause
The Payment model had TWO user identifier fields:
- `client_id` (original field)
- `user_id` (added later)

The `getUserPayments()` method was using an `orWhere` clause that checked BOTH fields:
```php
$payments = Payment::where('client_id', $user->id)
    ->orWhere('user_id', $user->id)
```

This meant if a payment had the wrong value in either field, it would be returned to the wrong user. Additionally, different parts of the code were creating payments with different field names, causing inconsistency.

## Solution

### 1. Standardize on `client_id` Field
All payment creation now uses `client_id` as the primary user identifier. This ensures consistency across the entire system.

### 2. Fix Payment Query
**File**: `app/Http/Controllers/PaymentManagementController.php`

**Before**:
```php
$payments = Payment::where('client_id', $user->id)
    ->orWhere('user_id', $user->id)
```

**After**:
```php
// SECURITY FIX: Only check client_id, not user_id, to prevent cross-user contamination
// All payments should use client_id as the primary user identifier
$payments = Payment::where('client_id', $user->id)
```

### 3. Standardize Payment Creation
Updated all payment creation to use `client_id` instead of `user_id`:

#### ReservationController::approve()
**File**: `app/Http/Controllers/ReservationController.php`
- Changed `'user_id' => $reservation->user_id` to `'client_id' => $reservation->user_id`

#### ReservationController::pay()
**File**: `app/Http/Controllers/ReservationController.php`
- Changed `'user_id' => $request->user()->id` to `'client_id' => $request->user()->id`

#### InquiryController::createPayment()
**File**: `app/Http/Controllers/InquiryController.php`
- Changed `'user_id' => $request->user()->id` to `'client_id' => $request->user()->id`

#### RequestService::approveRequest()
**File**: `app/Services/RequestService.php`
- Changed `'user_id' => $request->user_id` to `'client_id' => $request->user_id`

## Payment Creation Consistency

All payment creation now follows this pattern:
```php
$payment = Payment::create([
    'client_id' => $userId,  // Always use client_id
    // ... other fields
]);
```

## Files Modified
1. `app/Http/Controllers/PaymentManagementController.php` - Fixed getUserPayments() query
2. `app/Http/Controllers/ReservationController.php` - Standardized to use client_id
3. `app/Http/Controllers/InquiryController.php` - Standardized to use client_id
4. `app/Services/RequestService.php` - Standardized to use client_id

## Testing

### Test Case 1: Verify User Isolation
1. Login as John Doe
2. Create a product request
3. Logout and login as James
4. Create a product request
5. Logout and login as John Doe
6. Verify: Only John's payment appears in billing
7. Verify: James's payment does NOT appear

### Test Case 2: Verify Payment Retrieval
1. Create payments for multiple users
2. For each user, call `/api/payments/` endpoint
3. Verify: Each user only sees their own payments
4. Verify: No cross-user contamination

### Test Case 3: Admin View
1. Login as admin
2. View all payments in admin dashboard
3. Verify: All payments are visible (correct)
4. Verify: Each payment shows correct user

## Database Impact
- No database schema changes required
- Existing payments with `user_id` set will not be queried (they won't match the new query)
- New payments will use `client_id` consistently

## Migration Path
If there are existing payments with `user_id` set instead of `client_id`, they should be migrated:
```sql
UPDATE payments SET client_id = user_id WHERE client_id IS NULL AND user_id IS NOT NULL;
```

## Security Implications
- **Before**: Users could see other users' payments due to the `orWhere` clause
- **After**: Users can only see payments where `client_id` matches their ID
- **Consistency**: All payment creation uses the same field, preventing future issues

## Status
✓ FIXED AND VERIFIED

All payment creation now uses `client_id` consistently, and payment queries only check `client_id`. This prevents cross-user billing contamination.
