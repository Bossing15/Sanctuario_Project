# How to Buy a Lawn Lot - Easiest Explanation
# Paano Bumili ng Lawn Lot - Pinakamadaling Paliwanag

---

## 🎯 BUYING A LAWN LOT - STEP BY STEP

**Step 1: Open Website**

Customer opens website. Sees home page.

**Step 2: Click Lawn Lots**

Customer clicks "Lawn Lots." Sees lawn lot page. Sees pictures and prices. Sees "Request Now" button.

**Step 3: Click Request Now**

Customer clicks "Request Now." Website checks: Is customer logged in? If no, customer must log in first. If yes, website shows payment plan options.

**Step 4: Pick Payment Plan**

Website shows three plans: Monthly, Quarterly, Yearly. Customer picks one. Clicks "Select Plan."

**Step 5: Pick Purpose**

Website asks: Why do you want this? Customer picks: For burial, Pre-need, Family, or Other. Clicks "Next."

**Step 6: Fill Deceased Info**

Website asks for: Name of deceased, Date of death, Relationship. Customer fills it. Uploads ID file if needed. Clicks "Submit."

**Step 7: Pick a Lawn Lot**

Website shows a grid of lots. Each lot is a colored square with a number. Green = Available. Gray = Occupied. Customer clicks on a green square. Lot turns green with checkmark. Customer sees lot details below. Customer clicks "Confirm Selection."

**Step 8: Pick Payment Method**

Website shows payment summary. Shows total amount. Shows payment options: Credit Card, GCash, GrabPay, PayMaya. Customer picks one. Clicks "Pay."

**Step 9: Enter Payment Details**

Website goes to PayMongo (payment API). Customer enters card number, expiry, CVV, name, address, email. Clicks "Pay."

**Step 10: Payment Done**

If payment works: Website shows "Payment successful!" Shows confirmation. If payment fails: Website shows error. Customer can try again.

**Step 11: Check Dashboard**

Customer logs in. Clicks "Dashboard." Sees their reservation. Sees lot number, status, amount, plan. Sees confirmation email in inbox.

---

## 👨‍💼 WHAT HAPPENS ON THE ADMIN SIDE

**Admin Step 1: Admin Receives Notification**

When customer completes payment, server sends notification to admin. Admin's dashboard automatically updates. Admin sees a notification: "New reservation from [Customer Name]." Admin can see the new reservation in the "Reservations" section.

**Admin Step 2: Admin Views Reservation Details**

Admin clicks on the new reservation. Admin sees all details: Customer name, lot selected (A-001), section (Section A), payment amount (₱5,000), payment status (Paid), plan (Yearly), deceased information, and purpose.

**Admin Step 3: Admin Reviews the Reservation**

Admin reads all the information. Admin checks if everything is correct. Admin checks if lot is available. Admin checks if payment was received. Admin checks if customer provided all required information.

**Admin Step 4: Admin Approves or Rejects**

Admin can click "Approve" button to approve the reservation. Or admin can click "Reject" button to reject it. If admin approves, reservation status changes to "Approved." If admin rejects, admin must provide reason for rejection.

**Admin Step 5: Customer Gets Notification**

If admin approves: Server sends email to customer saying "Your reservation has been approved!" Customer can now see their reservation as "Approved" in dashboard. If admin rejects: Server sends email to customer saying "Your reservation was rejected" with reason. Lot becomes available again for other customers.

**Admin Step 6: Admin Manages Lot Inventory**

Admin can see all lots in the system. Admin can see which lots are available (green), occupied (gray), or reserved (brown). Admin can see which customer reserved each lot. Admin can track lot status and availability.

**Admin Step 7: Admin Tracks Payments**

Admin clicks "Billing" section. Admin sees all payments from all customers. Admin can see payment amount, payment date, payment status (Paid, Pending, Failed). Admin can see which customer made which payment. Admin can generate payment reports.

**Admin Step 8: Admin Sends Confirmation**

Admin can send additional confirmation or instructions to customer. Admin can send SMS or email with next steps. Admin can provide information about maintenance services available for the lot.

**Admin Step 9: Admin Monitors Dashboard**

Admin's dashboard shows real-time updates. Admin can see: Total reservations, Total payments received, Available lots, Occupied lots, Pending approvals. Admin can see all this information at a glance.

**Admin Step 10: Admin Handles Customer Inquiries**

If customer has questions, customer can contact admin. Admin can see customer messages in "Messages" section. Admin can reply to customer. Admin can provide support and assistance.

**Admin Step 11: Admin Prepares for Maintenance**

After customer buys lawn lot, customer can buy maintenance services. Admin can see maintenance requests. Admin can schedule maintenance. Admin can assign staff to maintain the lot. Admin can track maintenance history.

**Admin Step 12: Admin Generates Reports**

Admin can generate reports about: Total sales, Revenue, Customer list, Lot inventory, Payment history, Maintenance history. Admin can use these reports for business analysis.

---

## 🔄 COMPLETE FLOW: CLIENT AND ADMIN COMMUNICATION

**Timeline:**

1:00 PM - Customer opens website
1:05 PM - Customer selects lawn lot
1:10 PM - Customer completes payment
1:11 PM - Server saves reservation to database
1:12 PM - Server sends notification to admin
1:13 PM - Admin receives notification and sees new reservation
1:14 PM - Admin reviews reservation details
1:15 PM - Admin approves reservation
1:16 PM - Server sends approval email to customer
1:17 PM - Customer receives approval email
1:18 PM - Customer sees "Approved" status in dashboard
1:19 PM - Admin sees "Approved" status in admin dashboard
1:20 PM - Customer can now buy maintenance services

**What Happens Behind the Scenes:**

When customer pays, server saves: Customer ID, Lot ID, Payment amount, Payment date, Reservation status. Server sends notification to admin. Admin dashboard refreshes and shows new reservation. Admin clicks on reservation to see details. Admin approves or rejects. Server updates database with approval status. Server sends email to customer. Customer receives email and sees update in dashboard. Admin sees update in admin dashboard. Everything is synchronized in real-time.

---

## ⚠️ IMPORTANT CONDITIONS AND POSSIBILITIES

**Condition 1: Customer Must Be Logged In**

If customer is not logged in and clicks "Request Now," website shows login prompt. Customer must log in or create account first. Cannot buy lawn lot without logging in.

**Condition 2: Customer Can Only Select Available Lots**

When customer sees lot grid, only green squares are available. Gray squares are occupied and cannot be selected. Brown squares are lots customer already bought before. Customer cannot select occupied or already-owned lots.

**Condition 3: Payment Must Be Successful**

If payment fails (card declined, insufficient funds, etc.), website shows error. Lot is released and becomes available again. Customer can try payment again with different card or payment method.

**Condition 4: Customer Must Have Lawn Lot Before Buying Maintenance Service**

If customer tries to buy maintenance service (like grave cleaning) but does not have a lawn lot, website shows warning: "You must have a grave plot (Lawn Lot, Columbarium, or Family Estate) before you can purchase maintenance services. Please purchase a grave plot first." Customer must buy lawn lot first, then can buy maintenance service.

**Condition 5: Customer Can Buy Multiple Lawn Lots**

Customer can buy more than one lawn lot. Each lot is separate. Each lot has its own reservation number and payment. Customer can see all their lots in dashboard.

**Condition 6: Customer Can Choose Different Payment Plans**

Customer can choose Monthly (pay every month), Quarterly (pay every 3 months), or Yearly (pay once a year). Different plans have different prices. Customer can change plan if they want.

**Condition 7: Lot Selection Is Required**

Customer cannot skip lot selection. Must pick a specific lot from grid. Cannot proceed to payment without selecting a lot.

**Condition 8: Deceased Information Is Required**

Customer must fill deceased information. Cannot skip this step. Must provide name, date of death, and relationship. Website validates all fields before allowing next step.

**Condition 9: Payment Method Must Be Selected**

Customer must select a payment method (Credit Card, GCash, GrabPay, or PayMaya). Cannot proceed without selecting method.

**Condition 10: Admin Must Approve Reservation**

After customer pays, reservation is created. Admin sees it in dashboard. Admin can approve or reject reservation. Customer gets email notification when admin approves or rejects.

**Condition 11: Email Confirmation Is Automatic**

After successful payment, customer automatically gets confirmation email. Email contains reservation details, lot information, and payment receipt. Customer does not need to request email.

**Condition 12: Lot Cannot Be Selected Twice**

If customer already selected a lot, that lot becomes brown (Your Selection). Customer cannot select same lot again. Must pick different lot if buying another.

**Condition 13: Customer Can View Reservation Anytime**

After buying lawn lot, customer can log in anytime and see reservation in dashboard. Can view lot details, payment status, and plan information.

**Condition 14: Admin Can See All Reservations**

Admin can see all customer reservations in admin dashboard. Admin can view customer details, lot selected, payment status, and reservation status.

**Condition 15: System Sends Notifications**

When customer makes reservation, admin gets notification. When admin approves, customer gets email. When payment is received, both customer and admin get notification.

---

## 🔄 WHAT HAPPENS IN THE SYSTEM

Customer clicks something on website. Website sends message to server. Server checks database. Server sends answer back. Website shows result to customer. When customer pays, website sends payment info to PayMongo. PayMongo processes payment. PayMongo tells server if it worked. Server saves everything to database. Server sends email to customer. Server tells admin about new reservation.

---

## ✨ SUMMARY

Customer opens website. Clicks Lawn Lots. Clicks Request Now. Must be logged in. Picks payment plan. Picks purpose. Fills deceased info. Picks a lot from the grid (must be green/available). Picks payment method. Enters payment details. PayMongo processes payment. If successful, reservation appears in dashboard. Admin receives notification and sees new reservation. Admin reviews details and approves or rejects. If approved, customer gets approval email and sees "Approved" status. Admin can track payments, manage lot inventory, and handle maintenance requests. Customer can now buy maintenance services because they have a lawn lot. If customer tries to buy maintenance without lawn lot, system blocks it and tells customer to buy lawn lot first. Everything is saved in database. Customer and admin can see all information in real-time.

---

**Last Updated:** May 10, 2026
**Status:** Complete
**Difficulty:** Super Easy
