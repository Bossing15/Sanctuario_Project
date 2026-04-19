# Authorization Flow - Visual Guide

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CEMETERY MANAGEMENT SYSTEM                          │
│                    Authorization-Based Payment Flow                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              CUSTOMER SIDE
                              
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  1. BROWSE PRODUCTS/SERVICES                                            │
│     ├─ Lawn Lots (1000 available)                                       │
│     ├─ Columbariums (500 available)                                     │
│     ├─ Family Estates (20 available)                                    │
│     └─ Services (Maintenance, Cremation, Interment)                     │
│                                                                          │
│  2. CLICK "BUY NOW"                                                     │
│     ├─ Select Payment Plan (Monthly/Quarterly/Yearly)                   │
│     ├─ [IF PRODUCT] Select Lot/Niche/Estate                            │
│     └─ Select Payment Method (Card/GCash/GrabPay/PayMaya)              │
│                                                                          │
│  3. CLICK "PAY NOW" or "REQUEST SERVICE"                               │
│     │                                                                    │
│     ├─ PRODUCT PATH (Auto-Approved)                                    │
│     │  ├─ Lot available? YES                                           │
│     │  ├─ Create Booking (AUTO_APPROVED)                               │
│     │  ├─ Create Payment (pending)                                     │
│     │  ├─ Create PayMongo session                                      │
│     │  └─ Redirect to PayMongo → Payment → Receipt                     │
│     │                                                                    │
│     └─ SERVICE PATH (May require authorization)                        │
│        ├─ Customer linked to plot? YES → AUTO_APPROVED                 │
│        │  └─ Same as PRODUCT PATH above                                │
│        │                                                                │
│        └─ Customer linked to plot? NO → PENDING_AUTHORIZATION          │
│           ├─ Create Booking (PENDING_AUTHORIZATION)                    │
│           ├─ NO Payment created yet                                    │
│           ├─ Show message: "Waiting for approval..."                   │
│           └─ Wait for admin approval                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

                              ADMIN SIDE
                              
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  DASHBOARD → AUTHORIZATION REQUESTS SECTION                             │
│                                                                          │
│  ┌─ STATS CARDS ─────────────────────────────────────────────────────┐ │
│  │ Pending: 5  │  Authorized: 12  │  Auto-Approved: 48  │  Rejected: 2 │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─ PENDING REQUESTS TABLE ──────────────────────────────────────────┐ │
│  │ ID │ Customer │ Service │ Amount │ Date │ Status │ Actions      │ │
│  ├────┼──────────┼─────────┼────────┼──────┼────────┼──────────────┤ │
│  │ 1  │ John Doe │ Maint.  │ ₱5000  │ 4/19 │ ⏳ Pending │ [Review] │ │
│  │ 2  │ Jane Sm. │ Crem.   │ ₱8000  │ 4/19 │ ⏳ Pending │ [Review] │ │
│  │ 3  │ Bob Lee  │ Maint.  │ ₱3000  │ 4/18 │ ⏳ Pending │ [Review] │ │
│  └────┴──────────┴─────────┴────────┴──────┴────────┴──────────────┘ │
│                                                                          │
│  CLICK [Review] → MODAL OPENS                                          │
│  ┌─ AUTHORIZATION MODAL ─────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │ Request #1 - John Doe                                            │ │
│  │ Service: Grave Maintenance                                       │ │
│  │ Amount: ₱5,000                                                   │ │
│  │ Plan: Monthly                                                    │ │
│  │ Requested: April 19, 2026                                        │ │
│  │                                                                    │ │
│  │ [APPROVE] [REJECT]                                               │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ADMIN CLICKS [APPROVE]                                                │
│  ├─ Update Booking: authorization_status = AUTHORIZED                  │
│  ├─ Set approved_by = current admin ID                                 │
│  ├─ Set approved_at = now()                                            │
│  └─ Customer receives notification                                     │
│                                                                          │
│  CUSTOMER RECEIVES NOTIFICATION                                        │
│  ├─ "Your request has been approved!"                                  │
│  ├─ "You can now proceed with payment"                                 │
│  └─ Customer clicks "Pay Now"                                          │
│     └─ Create Payment + PayMongo session                               │
│        └─ Redirect to PayMongo → Payment → Receipt                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Decision Tree

```
                    CUSTOMER INITIATES PURCHASE
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Is it a PRODUCT?    │
                    │ (Lot/Niche/Estate)  │
                    └─────────────────────┘
                         │           │
                        YES          NO
                         │           │
                         ▼           ▼
                    ┌─────────┐  ┌──────────────┐
                    │ Lot     │  │ Is it a      │
                    │ avail?  │  │ SERVICE?     │
                    └─────────┘  └──────────────┘
                      │   │            │    │
                     YES  NO          YES   NO
                      │   │            │    │
                      ▼   ▼            ▼    ▼
                    ✅  ❌          ┌──────────────┐
                  AUTO  REJ        │ Customer     │
                  APPR  ECT        │ linked to    │
                  ED    ED         │ plot?        │
                                   └──────────────┘
                                      │      │
                                     YES    NO
                                      │      │
                                      ▼      ▼
                                    ✅      ⏳
                                  AUTO    PEND
                                  APPR    AUTH
                                  ED      
```

---

## Status Lifecycle

```
PRODUCT PURCHASE (Lot Available)
═════════════════════════════════════════════════════════════════════════

Booking Created
    │
    ├─ authorization_status: AUTO_APPROVED
    │
    ▼
Payment Created (status: pending)
    │
    ├─ paymongo_intent_id: ch_xxx
    │
    ▼
PayMongo Checkout Session Created
    │
    ├─ checkout_url: https://paymongo.com/checkout/...
    │
    ▼
Customer Completes Payment
    │
    ├─ PayMongo redirects to success page
    │
    ▼
Payment Updated (status: completed)
Booking Updated (status: Paid)
    │
    ├─ completed_at: now()
    │ ├─ paid_date: now()
    │
    ▼
Receipt Generated & Displayed


SERVICE PURCHASE (Customer Not Linked)
═════════════════════════════════════════════════════════════════════════

Booking Created
    │
    ├─ authorization_status: PENDING_AUTHORIZATION
    │
    ▼
Response Sent to Customer (202)
    │
    ├─ message: "Your request is pending approval"
    │
    ▼
Customer Sees Waiting Message
    │
    ├─ "You will be notified once approved"
    │
    ▼
Admin Reviews in Dashboard
    │
    ├─ Sees pending request
    │ ├─ Customer details
    │ ├─ Service type
    │ ├─ Amount
    │
    ▼
Admin Clicks [APPROVE]
    │
    ├─ authorization_status: AUTHORIZED
    │ ├─ approved_by: admin_id
    │ ├─ approved_at: now()
    │
    ▼
Customer Receives Notification
    │
    ├─ "Your request has been approved!"
    │
    ▼
Customer Clicks "Pay Now"
    │
    ├─ Payment Created (status: pending)
    │ ├─ PayMongo session created
    │
    ▼
[Same as PRODUCT PATH from here]


PRODUCT PURCHASE (Lot Unavailable)
═════════════════════════════════════════════════════════════════════════

Booking Created
    │
    ├─ authorization_status: REJECTED
    │
    ▼
Response Sent to Customer (400)
    │
    ├─ message: "Transaction cannot be processed"
    │ ├─ reason: "The selected lot is not available"
    │
    ▼
Customer Sees Error Message
    │
    ├─ "Please select a different lot"
    │
    ▼
NO Payment Created
NO PayMongo Session Created
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                                │
│                                                                         │
│  PaymentModal.jsx                                                       │
│  ├─ Collects: product_id, service_id, grave_id, plan_type             │
│  ├─ Sends: POST /api/payments/create-checkout-public                  │
│  └─ Receives: checkout_url OR pending_authorization message           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP POST
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Laravel)                               │
│                                                                         │
│  PaymentController::createCheckoutSession()                            │
│  ├─ Validates input                                                    │
│  ├─ Creates Booking                                                    │
│  │                                                                     │
│  ├─ Calls AuthorizationService::determineAuthorizationStatus()        │
│  │  ├─ Checks if PRODUCT or SERVICE                                   │
│  │  ├─ Checks availability/linkage                                    │
│  │  └─ Returns: AUTO_APPROVED | PENDING_AUTHORIZATION | REJECTED      │
│  │                                                                     │
│  ├─ If AUTO_APPROVED:                                                 │
│  │  ├─ Creates Payment (status: pending)                              │
│  │  ├─ Creates PayMongo session                                       │
│  │  └─ Returns: checkout_url                                          │
│  │                                                                     │
│  ├─ If PENDING_AUTHORIZATION:                                         │
│  │  ├─ NO Payment created                                             │
│  │  └─ Returns: pending_authorization message                         │
│  │                                                                     │
│  └─ If REJECTED:                                                       │
│     ├─ NO Payment created                                             │
│     └─ Returns: error message                                         │
│                                                                         │
│  Database Updates:                                                     │
│  ├─ bookings table: new record with authorization_status              │
│  ├─ payments table: new record (if AUTO_APPROVED)                     │
│  └─ graves table: no changes                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP Response
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                                │
│                                                                         │
│  If AUTO_APPROVED:                                                      │
│  ├─ Redirect to checkout_url (PayMongo)                               │
│  └─ Customer completes payment                                        │
│                                                                         │
│  If PENDING_AUTHORIZATION:                                             │
│  ├─ Show message: "Your request is pending approval"                  │
│  └─ Wait for notification                                             │
│                                                                         │
│  If REJECTED:                                                          │
│  ├─ Show error: "The selected lot is not available"                   │
│  └─ Allow customer to select different lot                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Admin Approval Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                                      │
│                                                                         │
│  Authorization Requests Section                                        │
│  ├─ Stats: Pending (5), Authorized (12), Auto-Approved (48), Rejected (2)
│  │                                                                     │
│  └─ Pending Requests Table                                            │
│     ├─ Request #1: John Doe - Maintenance - ₱5000 - [Review]         │
│     ├─ Request #2: Jane Smith - Cremation - ₱8000 - [Review]         │
│     └─ Request #3: Bob Lee - Maintenance - ₱3000 - [Review]          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Click [Review]
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION MODAL                                  │
│                                                                         │
│  Request Details:                                                      │
│  ├─ ID: 1                                                              │
│  ├─ Customer: John Doe (john@example.com)                             │
│  ├─ Service: Grave Maintenance                                        │
│  ├─ Amount: ₱5,000                                                    │
│  ├─ Plan: Monthly                                                     │
│  ├─ Requested: April 19, 2026                                         │
│  │                                                                     │
│  └─ Actions:                                                           │
│     ├─ [APPROVE] → Update booking, notify customer                    │
│     └─ [REJECT] → Show reason input, update booking, notify customer  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            [APPROVE CLICKED]          [REJECT CLICKED]
                    │                           │
                    ▼                           ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │ Update Booking:      │    │ Show Reason Input:   │
        │ ├─ auth_status:      │    │ ├─ "Why reject?"     │
        │ │  AUTHORIZED        │    │ └─ [Submit]          │
        │ ├─ approved_by: 1    │    │                      │
        │ └─ approved_at: now  │    └──────────────────────┘
        │                      │              │
        │ Send Notification:   │              ▼
        │ "Approved!"          │    ┌──────────────────────┐
        │                      │    │ Update Booking:      │
        └──────────────────────┘    │ ├─ auth_status:      │
                    │               │  REJECTED           │
                    │               │ ├─ rejection_reason: │
                    │               │  "Reason text"       │
                    │               │ └─ rejected_at: now  │
                    │               │                      │
                    │               │ Send Notification:   │
                    │               │ "Rejected: Reason"   │
                    │               │                      │
                    │               └──────────────────────┘
                    │                           │
                    ▼                           ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │ Customer Notified:   │    │ Customer Notified:   │
        │ "Approved!"          │    │ "Rejected: Reason"   │
        │                      │    │                      │
        │ Customer can now:    │    │ Customer must:       │
        │ ├─ Click "Pay Now"   │    │ ├─ Select different  │
        │ ├─ Create Payment    │    │ │  lot/service       │
        │ ├─ PayMongo session  │    │ └─ Resubmit request  │
        │ └─ Complete payment  │    │                      │
        │                      │    │                      │
        └──────────────────────┘    └──────────────────────┘
```

---

## Summary

This authorization-based payment flow ensures:
- ✅ **Validation before payment** - Invalid requests caught early
- ✅ **Reduced refunds** - No payment for unavailable lots
- ✅ **Centralized control** - Admin dashboard manages all approvals
- ✅ **Smooth UX** - Auto-approved transactions proceed immediately
- ✅ **Audit trail** - All decisions tracked with admin info
