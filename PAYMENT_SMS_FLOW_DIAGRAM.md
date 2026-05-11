# Payment Success SMS Flow Diagram

## Complete Payment to SMS Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT-APP (Frontend)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User selects product/service                               │
│     ↓                                                           │
│  2. Opens PaymentModal                                         │
│     ↓                                                           │
│  3. Selects payment method                                     │
│     ↓                                                           │
│  4. Clicks "Pay Now"                                           │
│     ↓                                                           │
│  5. Redirected to PayMongo checkout                            │
│     ↓                                                           │
│  6. Completes payment on PayMongo                              │
│     ↓                                                           │
│  7. PayMongo redirects to /payment/success                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Laravel)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PaymentController::paymentSuccess()                           │
│     ↓                                                           │
│  1. Get payment_id from query params                           │
│     ↓                                                           │
│  2. Find Payment record in database                            │
│     ↓                                                           │
│  3. Update payment status to "completed"                       │
│     ↓                                                           │
│  4. Get Client from database                                   │
│     ↓                                                           │
│  5. Update related records (booking, reservation, etc.)        │
│     ↓                                                           │
│  6. Check if client has phone number                           │
│     ↓                                                           │
│  7. Call sendPaymentSuccessSms($client, $payment)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              SMS NOTIFICATION GENERATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  sendPaymentSuccessSms() Method                                │
│     ↓                                                           │
│  1. Format payment amount: ₱5,000.00                           │
│     ↓                                                           │
│  2. Create message:                                            │
│     "Dear [Name], your payment of ₱[Amount] has been          │
│      successfully received by Sanctuario De Carmona            │
│      Memorial Park. Reference: [Ref]. Thank you for           │
│      your trust."                                              │
│     ↓                                                           │
│  3. Check message length (160 char limit)                      │
│     ↓                                                           │
│  4. If too long, use fallback message                          │
│     ↓                                                           │
│  5. Call SmsService::sendSms()                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              SMS SERVICE (SmsService)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  sendSms($phone, $message, $reference)                         │
│     ↓                                                           │
│  1. Validate phone number format                               │
│     ✓ 09123456789                                              │
│     ✓ +639123456789                                            │
│     ✓ 639123456789                                             │
│     ↓                                                           │
│  2. Validate message not empty                                 │
│     ↓                                                           │
│  3. Limit message to 160 characters                            │
│     ↓                                                           │
│  4. Call Semaphore API                                         │
│     POST https://api.semaphore.co/api/v4/messages              │
│     ↓                                                           │
│  5. Send with parameters:                                      │
│     - apikey: 4dcfd6ecbf34adbd2e5a3173699ff0d9                │
│     - number: 09123456789                                      │
│     - message: [SMS text]                                      │
│     - reference: payment_success_123                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              SEMAPHORE SMS API                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Receive SMS request                                        │
│     ↓                                                           │
│  2. Validate API key                                           │
│     ↓                                                           │
│  3. Validate phone number                                      │
│     ↓                                                           │
│  4. Deduct 1 SMS credit (695 → 694)                            │
│     ↓                                                           │
│  5. Queue SMS for delivery                                     │
│     ↓                                                           │
│  6. Return success response                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              SMS DELIVERY                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SMS routed to telecom provider                             │
│     ↓                                                           │
│  2. Delivered to customer phone                                │
│     ↓                                                           │
│  3. Customer receives SMS notification ✅                      │
│                                                                 │
│  Message Example:                                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Dear John Doe, your payment of ₱5,000.00 has been       │ │
│  │ successfully received by Sanctuario De Carmona Memorial  │ │
│  │ Park. Reference: PAY-123456789. Thank you for your      │ │
│  │ trust.                                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              LOGGING & TRACKING                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Log SMS success in Laravel logs                            │
│     storage/logs/laravel.log                                   │
│     ↓                                                           │
│  2. Create SMS log entry in database                           │
│     sms_logs table                                             │
│     ↓                                                           │
│  3. Record:                                                    │
│     - phone_number: 09123456789                                │
│     - message: [SMS text]                                      │
│     - type: general                                            │
│     - status: sent                                             │
│     - sent_at: 2026-05-12 10:30:45                             │
│     - reference: payment_success_123                           │
│     - response: [API response JSON]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Payment Completion
    ↓
    ├─→ Update Payment Status
    ├─→ Update Booking/Reservation
    ├─→ Get Client Data
    │   ├─→ Client Name
    │   ├─→ Client Phone
    │   └─→ Client ID
    ├─→ Get Payment Data
    │   ├─→ Payment Amount
    │   ├─→ Payment Reference
    │   └─→ Payment ID
    ├─→ Format Message
    │   ├─→ Format Amount (₱5,000.00)
    │   ├─→ Create Message
    │   └─→ Check Length
    ├─→ Send SMS
    │   ├─→ Validate Phone
    │   ├─→ Call Semaphore API
    │   └─→ Deduct Credit
    └─→ Log Result
        ├─→ Laravel Log
        └─→ SMS Log Database
```

## Message Generation

```
Input Data:
├─ Client Name: "John Doe"
├─ Payment Amount: 5000.00
├─ Payment Reference: "PAY-123456789"
└─ Company Name: "Sanctuario De Carmona Memorial Park"

Processing:
├─ Format Amount: "₱5,000.00"
├─ Build Message: "Dear John Doe, your payment of ₱5,000.00..."
├─ Check Length: 158 characters ✓
└─ Message Ready

Output:
"Dear John Doe, your payment of ₱5,000.00 has been successfully 
received by Sanctuario De Carmona Memorial Park. Reference: 
PAY-123456789. Thank you for your trust."
```

## Error Handling Flow

```
SMS Sending Process
    ↓
    ├─→ Phone Number Invalid?
    │   └─→ Log Warning
    │   └─→ Skip SMS
    │   └─→ Payment Still Completes ✓
    │
    ├─→ SMS API Error?
    │   └─→ Log Error
    │   └─→ SMS Not Sent
    │   └─→ Payment Still Completes ✓
    │
    ├─→ Exception Caught?
    │   └─→ Log Exception
    │   └─→ SMS Not Sent
    │   └─→ Payment Still Completes ✓
    │
    └─→ Success?
        └─→ Log Success
        └─→ SMS Sent ✓
        └─→ Payment Completes ✓
```

## Timeline Example

```
10:30:00 - User clicks "Pay Now"
10:30:05 - PayMongo processes payment
10:30:10 - PayMongo redirects to /payment/success
10:30:11 - PaymentController::paymentSuccess() triggered
10:30:12 - Payment status updated to "completed"
10:30:13 - Client data retrieved
10:30:14 - sendPaymentSuccessSms() called
10:30:15 - Message formatted and validated
10:30:16 - SmsService::sendSms() called
10:30:17 - Semaphore API called
10:30:18 - SMS credit deducted (695 → 694)
10:30:19 - SMS queued for delivery
10:30:20 - SMS logged in database
10:30:21 - SMS routed to telecom
10:30:25 - Customer receives SMS ✅
```

## Status Codes

```
Payment Success Flow:
├─ Payment Status: "completed" ✓
├─ Booking Status: "Paid" ✓
├─ Reservation Status: "paid" ✓
├─ SMS Type: "general" ✓
├─ SMS Status: "sent" ✓
└─ Overall: SUCCESS ✓
```

## Integration Points

```
PaymentController
    ↓
    ├─→ SmsService (SMS sending)
    ├─→ Client Model (Customer data)
    ├─→ Payment Model (Payment data)
    ├─→ Booking Model (Booking status)
    ├─→ Reservation Model (Reservation status)
    ├─→ Inquiry Model (Request status)
    ├─→ SmsLog Model (SMS logging)
    └─→ Semaphore API (SMS delivery)
```
