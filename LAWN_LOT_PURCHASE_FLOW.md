# How to Buy a Lawn Lot - Step by Step Guide
# Paano Bumili ng Lawn Lot - Hakbang sa Hakbang na Gabay

---

## 🎯 COMPLETE FLOW: Customer Buys a Lawn Lot

This guide shows exactly what happens when a customer buys a lawn lot, from start to finish.

---

## 📱 STEP 1: Customer Opens the Website

**What the customer does:**
- Opens browser
- Goes to: `https://www.sanctuario.com`
- Sees the home page

**What happens in the system:**
- Frontend loads the website
- Customer sees navigation menu
- Customer sees "Lawn Lots" option

---

## 🏠 STEP 2: Customer Clicks "Lawn Lots"

**What the customer does:**
- Clicks on "Lawn Lots" in the menu or on the home page
- Waits for the page to load

**What happens in the system:**
- Frontend sends request to backend: "Get lawn lots information"
- Backend goes to database and gets lawn lot details
- Backend sends back: Price, description, images
- Frontend displays: Beautiful lawn lot page with images and pricing

**What customer sees:**
- Lawn lot page with description
- Images of lawn lots
- Pricing options (Monthly, Quarterly, Yearly)
- "Request Now" button

---

## 💰 STEP 3: Customer Clicks "Request Now" Button

**What the customer does:**
- Reads the lawn lot information
- Clicks the "Request Now" button

**What happens in the system:**
- Frontend checks: Is the customer logged in?
  - If NO: Shows login prompt
  - If YES: Continues to next step

**If customer is NOT logged in:**
- Frontend shows: "Please log in to continue"
- Customer must log in or sign up first
- After login, customer clicks "Request Now" again

**If customer IS logged in:**
- Frontend opens: "Select Payment Plan" modal/popup

---

## 💳 STEP 4: Customer Selects Payment Plan

**What the customer sees:**
- A popup showing three payment plan options:
  1. **Monthly Plan** - Pay ₱X every month
  2. **Quarterly Plan** - Pay ₱X every 3 months
  3. **Yearly Plan** - Pay ₱X every year

**What the customer does:**
- Reads the three options
- Clicks on one plan (e.g., "Yearly Plan")
- Clicks "Select Plan" button

**What happens in the system:**
- Frontend saves: Selected plan and amount
- Frontend closes: Payment plan popup
- Frontend opens: "Select Purpose" popup

---

## 🎯 STEP 5: Customer Selects Purpose

**What the customer sees:**
- A popup asking: "What is the purpose of this request?"
- Options like:
  - For burial
  - For pre-need
  - For family
  - Other

**What the customer does:**
- Selects a purpose (e.g., "For burial")
- Clicks "Next" or "Continue"

**What happens in the system:**
- Frontend saves: Selected purpose
- Frontend closes: Purpose popup
- Frontend opens: "Deceased Information" form

---

## 👤 STEP 6: Customer Fills Deceased Information

**What the customer sees:**
- A form asking for deceased person's details:
  - Full name of deceased
  - Date of death
  - Relationship to customer
  - Any other required information

**What the customer does:**
- Fills in the form with deceased person's information
- Uploads ID file (if required)
- Clicks "Submit" or "Continue"

**What happens in the system:**
- Frontend validates: All required fields filled?
- Frontend saves: Deceased information
- Frontend closes: Deceased information form
- Frontend opens: "Select Your Lot" popup (Lot Selector)

---

## 🗺️ STEP 7: Customer Selects Available Lawn Lot

**This is the key step where customer picks their specific lawn lot!**

**What the customer sees:**
- A popup titled: "Select Your Lot"
- A grid showing all available lawn lots
- Each lot is a colored square with a number (e.g., "A-001", "A-002")
- Lot colors mean:
  - **Green** = Available (can select)
  - **Gray** = Occupied (cannot select)
  - **Brown** = Your previous selection (cannot select again)
  - **Blue/Yellow/Pink** = Different sections (Super Premium, Premium, Deluxe, Standard)

**Additional features:**
- **Location buttons** at the top: "Section A", "Section B"
- **Statistics** showing:
  - Total Lots: 100
  - Available: 45
  - Occupied: 55
- **Legend** showing what each color means

**What the customer does:**
1. Looks at the lot grid
2. Clicks on a location button if they want to see a specific section (e.g., "Section A")
3. Sees lots in that section
4. Clicks on an available lot (green square)
5. Lot turns green with a checkmark
6. Sees lot details below:
   - Plot Number: A-001
   - Section: Section A
   - Location: Garden Area 1
   - Status: Available
7. Clicks "Confirm Selection" button

**What happens in the system:**
- Frontend sends to backend: "I selected lot A-001"
- Backend saves: This lot is now reserved for this customer
- Backend returns: Confirmation
- Frontend shows: Success message "A-001 selected! Proceeding to payment..."
- Frontend closes: Lot selector popup
- Frontend opens: Payment method selection

---

## 💳 STEP 8: Customer Selects Payment Method

**What the customer sees:**
- A payment modal showing:
  - Reservation Summary:
    - Service: Lawn Lots
    - Plan: Yearly
    - Total Amount: ₱X,XXX.XX
  - Payment Method Options:
    1. Credit/Debit Card (Visa, Mastercard)
    2. GCash (Mobile wallet)
    3. GrabPay (Grab wallet)
    4. PayMaya (PayMaya wallet)

**What the customer does:**
- Reads the reservation summary
- Selects a payment method (e.g., "Credit/Debit Card")
- Clicks "Pay ₱X,XXX.XX" button

**What happens in the system:**
- Frontend validates: Payment method selected?
- Frontend sends to backend: "Process payment with this method"
- Backend connects to PayMongo (payment company)
- PayMongo creates: Payment checkout page
- Backend sends: Checkout URL to frontend
- Frontend redirects: Customer to PayMongo checkout page

---

## 🔐 STEP 9: Customer Enters Payment Details

**What the customer sees:**
- PayMongo payment page (secure payment gateway)
- Form asking for:
  - Card number
  - Expiry date
  - CVV
  - Cardholder name
  - Billing address
  - Email

**What the customer does:**
- Enters payment details
- Clicks "Pay" button

**What happens in the system:**
- PayMongo validates: Card details correct?
- PayMongo processes: Payment through credit card company
- Credit card company: Approves or declines payment
- PayMongo returns: Success or failure to backend
- Backend updates database: Payment status

---

## ✅ STEP 10: Payment Confirmation

**If payment is SUCCESSFUL:**

**What the customer sees:**
- PayMongo shows: "Payment successful!"
- Redirects to: Sanctuario confirmation page
- Shows: "Your reservation has been confirmed!"
- Shows: Reservation details:
  - Lot: A-001
  - Section: Section A
  - Plan: Yearly
  - Amount: ₱X,XXX.XX
  - Status: Confirmed

**What happens in the system:**
- Backend updates database: Payment status = "Paid"
- Backend updates database: Reservation status = "Confirmed"
- Backend sends: Confirmation email to customer
- Backend sends: Notification to admin
- Frontend shows: Success message
- Customer can now see reservation in their dashboard

**If payment FAILS:**

**What the customer sees:**
- PayMongo shows: "Payment failed"
- Shows: Error message (e.g., "Card declined")
- Option to: Try again with different card or method

**What happens in the system:**
- Backend updates database: Payment status = "Failed"
- Lot is released: Available for other customers
- Backend sends: Error notification to customer
- Customer can: Try payment again

---

## 📧 STEP 11: Customer Receives Confirmation Email

**What the customer receives:**
- Email with subject: "Your Lawn Lot Reservation Confirmed"
- Email contains:
  - Reservation number
  - Lot details (Plot number, Section, Location)
  - Payment details (Amount, Plan, Date)
  - Next steps
  - Contact information

**What happens in the system:**
- Backend connects to: Email service (Resend)
- Backend tells Resend: "Send confirmation email to customer"
- Resend sends: Email to customer's email address
- Customer receives: Email in inbox

---

## 📱 STEP 12: Customer Views Dashboard

**What the customer does:**
- Logs into their account
- Clicks "Dashboard" or "My Reservations"

**What the customer sees:**
- Their reservation listed with:
  - Lot number: A-001
  - Status: Confirmed
  - Payment status: Paid
  - Plan: Yearly
  - Amount: ₱X,XXX.XX
  - Next payment date (if applicable)

**What happens in the system:**
- Frontend sends to backend: "Get my reservations"
- Backend queries database: Get all reservations for this customer
- Backend returns: Reservation data
- Frontend displays: Reservation in dashboard

---

## 👨‍💼 STEP 13: Admin Sees New Reservation

**What the admin sees:**
- Admin dashboard automatically updates
- New reservation notification appears
- Admin can click "Reservations" to see:
  - Customer name
  - Lot selected: A-001
  - Payment status: Paid
  - Reservation status: Confirmed

**What happens in the system:**
- Backend sends: Notification to admin
- Admin dashboard refreshes (every few seconds)
- Admin sees: New reservation in the list

---

## 🎯 COMPLETE FLOW SUMMARY

```
Customer Opens Website
        ↓
Customer Clicks "Lawn Lots"
        ↓
Customer Clicks "Request Now"
        ↓
Customer Selects Payment Plan (Monthly/Quarterly/Yearly)
        ↓
Customer Selects Purpose (For burial, Pre-need, etc.)
        ↓
Customer Fills Deceased Information
        ↓
Customer Selects Available Lot (A-001, B-005, etc.)
        ↓
Customer Selects Payment Method (Card, GCash, etc.)
        ↓
Customer Enters Payment Details
        ↓
Payment Processed by PayMongo
        ↓
Payment Successful ✓
        ↓
Confirmation Email Sent
        ↓
Reservation Appears in Dashboard
        ↓
Admin Sees New Reservation
        ↓
COMPLETE!
```

---

## 🔄 WHAT HAPPENS BEHIND THE SCENES

**When customer clicks "Request Now":**
1. Frontend checks if customer is logged in
2. If not logged in, shows login prompt
3. If logged in, opens payment plan selector

**When customer selects a plan:**
1. Frontend saves the plan and amount
2. Frontend opens purpose selector

**When customer selects purpose:**
1. Frontend saves the purpose
2. Frontend opens deceased information form

**When customer fills deceased info:**
1. Frontend validates all fields
2. Frontend saves the information
3. Frontend opens lot selector

**When customer selects a lot:**
1. Frontend sends lot ID to backend
2. Backend checks if lot is available
3. Backend reserves the lot for this customer
4. Backend returns confirmation
5. Frontend shows success message
6. Frontend opens payment method selector

**When customer selects payment method:**
1. Frontend validates payment method selected
2. Frontend sends payment request to backend
3. Backend connects to PayMongo
4. PayMongo creates checkout page
5. Backend sends checkout URL to frontend
6. Frontend redirects customer to PayMongo

**When customer enters payment details:**
1. PayMongo validates card details
2. PayMongo processes payment
3. PayMongo returns result to backend
4. Backend updates database
5. Backend sends confirmation email
6. Backend notifies admin

---

## 📊 DATA FLOW

```
CUSTOMER SIDE (Frontend)
├─ Opens website
├─ Clicks "Lawn Lots"
├─ Clicks "Request Now"
├─ Selects payment plan
├─ Selects purpose
├─ Fills deceased info
├─ Selects lot from grid
├─ Selects payment method
└─ Enters payment details

        ↓ (API Requests)

SERVER SIDE (Backend)
├─ Receives requests
├─ Validates data
├─ Checks lot availability
├─ Reserves lot
├─ Connects to PayMongo
├─ Processes payment
├─ Updates database
├─ Sends confirmation email
└─ Notifies admin

        ↓ (Stores data)

DATABASE (Storage)
├─ Saves reservation
├─ Saves payment
├─ Saves lot selection
├─ Saves customer info
└─ Saves transaction history
```

---

## ✨ KEY POINTS

1. **Login Required** - Customer must be logged in to buy a lawn lot
2. **Payment Plan** - Customer chooses how often to pay (Monthly, Quarterly, Yearly)
3. **Purpose** - Customer specifies why they're buying (burial, pre-need, etc.)
4. **Deceased Info** - Customer provides information about the deceased
5. **Lot Selection** - Customer picks a specific available lot from the grid
6. **Payment Method** - Customer chooses how to pay (Card, GCash, etc.)
7. **Payment Processing** - PayMongo handles the actual payment
8. **Confirmation** - Customer gets email confirmation
9. **Dashboard** - Customer can see their reservation anytime
10. **Admin Notification** - Admin is notified of new reservation

---

## 🎓 WHAT EACH PART DOES

**Frontend (Website):**
- Shows lot grid
- Collects customer information
- Validates form data
- Sends requests to backend
- Shows confirmation messages

**Backend (Server):**
- Checks lot availability
- Reserves lot for customer
- Connects to PayMongo
- Processes payment
- Saves everything to database
- Sends confirmation email

**Database (Storage):**
- Stores reservation details
- Stores payment information
- Stores lot selection
- Stores customer information
- Keeps transaction history

**PayMongo (Payment Company):**
- Processes credit card payment
- Handles GCash payment
- Handles GrabPay payment
- Handles PayMaya payment
- Returns payment result

**Email Service (Resend):**
- Sends confirmation email
- Sends payment receipt
- Sends notifications

---

## 🚀 TIMELINE EXAMPLE

```
1:00 PM - Customer opens website
1:02 PM - Customer clicks "Lawn Lots"
1:03 PM - Customer clicks "Request Now"
1:04 PM - Customer selects "Yearly Plan"
1:05 PM - Customer selects "For burial"
1:06 PM - Customer fills deceased information
1:07 PM - Customer selects lot "A-001"
1:08 PM - Customer selects "Credit Card" payment
1:09 PM - Customer enters card details
1:10 PM - PayMongo processes payment
1:11 PM - Payment successful!
1:12 PM - Confirmation email sent
1:13 PM - Reservation appears in dashboard
1:14 PM - Admin sees new reservation
```

---

**Last Updated:** May 10, 2026
**Status:** Complete
**Difficulty:** Beginner-Friendly
**Language:** Simple English with Tagalog Headers
