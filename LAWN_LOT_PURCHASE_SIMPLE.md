# How to Buy a Lawn Lot - Simple Paragraph Guide
# Paano Bumili ng Lawn Lot - Simpleng Gabay

---

## 🎯 HOW A CUSTOMER BUYS A LAWN LOT

A customer wants to buy a lawn lot. Here's what happens step by step.

**Step 1: Customer Opens Website**

The customer opens their browser and goes to the Sanctuario website. They see the home page with information about services. They can see a menu with different options.

**Step 2: Customer Clicks Lawn Lots**

The customer clicks on "Lawn Lots" in the menu. The website loads the lawn lots page. The customer sees pictures of lawn lots, a description, and pricing options. There are three payment plans: Monthly, Quarterly, and Yearly. Each plan shows a different price. The customer also sees a "Request Now" button.

**Step 3: Customer Clicks Request Now**

The customer reads the information and clicks the "Request Now" button. The website checks if the customer is logged in. If the customer is not logged in, the website shows a message saying "Please log in to continue." The customer must log in or create an account first. If the customer is already logged in, the website opens a popup showing the three payment plans.

**Step 4: Customer Selects Payment Plan**

The website shows a popup with three payment plan options. The customer can choose Monthly Plan (pay every month), Quarterly Plan (pay every 3 months), or Yearly Plan (pay once a year). Each plan shows the price. The customer picks one plan and clicks "Select Plan." The website saves the plan and amount the customer chose.

**Step 5: Customer Selects Purpose**

The website opens another popup asking "What is the purpose of this request?" The customer can choose options like "For burial," "For pre-need," "For family," or "Other." The customer picks one option and clicks "Next." The website saves the purpose.

**Step 6: Customer Fills Deceased Information**

The website opens a form asking for information about the deceased person. The customer fills in the name of the deceased, the date of death, and their relationship to the deceased. The customer might also need to upload an ID file. After filling everything, the customer clicks "Submit." The website saves all this information.

**Step 7: Customer Selects a Lawn Lot**

This is the most important step. The website opens a popup showing a grid of lawn lots. Each lot is a colored square with a number like "A-001" or "B-005." The colors mean different things. Green squares are available lots that the customer can buy. Gray squares are occupied lots that are already sold. Brown squares are lots the customer already selected before. The website also shows buttons at the top for "Section A" and "Section B" so the customer can see different areas. At the top, the website shows statistics like "Total Lots: 100, Available: 45, Occupied: 55." The customer looks at the grid and clicks on a green square (available lot). When the customer clicks on a lot, it turns green and shows a checkmark. Below the grid, the website shows the details of the selected lot like "Plot Number: A-001, Section: Section A, Location: Garden Area 1, Status: Available." The customer reads the details and clicks "Confirm Selection." The website sends the lot information to the server. The server checks if the lot is still available. If it is, the server reserves the lot for this customer. The website shows a success message like "A-001 selected! Proceeding to payment..."

**Step 8: Customer Selects Payment Method**

The website opens a payment popup. It shows a summary of the reservation with the service name (Lawn Lots), the plan (Yearly), and the total amount (like ₱5,000). Below that, the website shows payment method options. The customer can choose Credit/Debit Card, GCash, GrabPay, or PayMaya. The customer picks one payment method and clicks "Pay ₱5,000" button.

**Step 9: Customer Enters Payment Details**

The website redirects the customer to PayMongo, which is a secure payment company. PayMongo shows a payment form asking for card number, expiry date, CVV, cardholder name, billing address, and email. The customer fills in all the details and clicks "Pay." PayMongo processes the payment through the credit card company. The credit card company approves or declines the payment. PayMongo tells the server if the payment was successful or failed.

**Step 10: Payment Confirmation**

If the payment is successful, PayMongo shows "Payment successful!" and redirects the customer back to the Sanctuario website. The website shows a confirmation page with the message "Your reservation has been confirmed!" The page shows all the reservation details like the lot number (A-001), section (Section A), plan (Yearly), amount (₱5,000), and status (Confirmed). If the payment fails, PayMongo shows an error message like "Card declined." The customer can try again with a different card or payment method. The lot is released and becomes available for other customers again.

**Step 11: Customer Receives Confirmation Email**

The server sends a confirmation email to the customer's email address. The email has the subject "Your Lawn Lot Reservation Confirmed." The email contains the reservation number, lot details (plot number, section, location), payment details (amount, plan, date), next steps, and contact information. The customer receives the email in their inbox.

**Step 12: Customer Views Dashboard**

The customer logs into their account and clicks "Dashboard" or "My Reservations." The website shows all the customer's reservations. The customer can see their lawn lot reservation with the lot number (A-001), status (Confirmed), payment status (Paid), plan (Yearly), amount (₱5,000), and next payment date if applicable. The website sends a request to the server asking for all reservations for this customer. The server gets the information from the database and sends it back. The website displays the reservation nicely on the dashboard.

**Step 13: Admin Sees New Reservation**

The admin's dashboard automatically updates and shows a notification about the new reservation. The admin can click "Reservations" to see all reservations. The admin can see the customer's name, the lot selected (A-001), the payment status (Paid), and the reservation status (Confirmed). The server sends a notification to the admin. The admin's dashboard refreshes every few seconds to show new reservations.

---

## 🔄 WHAT HAPPENS BEHIND THE SCENES

When the customer clicks "Request Now," the website checks if they are logged in. If not, it shows a login prompt. If yes, it opens the payment plan selector. When the customer selects a plan, the website saves it and opens the purpose selector. When the customer selects a purpose, the website saves it and opens the deceased information form. When the customer fills the form, the website validates all the fields and saves the information. Then it opens the lot selector. When the customer selects a lot, the website sends the lot ID to the server. The server checks if the lot is available. If it is, the server reserves it for this customer and sends back a confirmation. The website shows a success message and opens the payment method selector. When the customer selects a payment method, the website validates that a method is selected. Then it sends a payment request to the server. The server connects to PayMongo and creates a checkout page. The server sends the checkout URL to the website. The website redirects the customer to PayMongo. When the customer enters payment details, PayMongo validates the card details and processes the payment. PayMongo returns the result to the server. The server updates the database to mark the payment as successful. The server sends a confirmation email to the customer. The server notifies the admin about the new reservation.

---

## 📊 HOW THE SYSTEM WORKS

The system has three main parts. The website (frontend) is what the customer sees and interacts with. The server (backend) is the invisible brain that processes everything. The database is where all the information is stored. When the customer does something on the website, the website sends a request to the server. The server receives the request, thinks about it, and does what it asks. The server might save information to the database or get information from the database. The server sends back a response to the website. The website receives the response and shows the result to the customer. PayMongo is an external company that handles payments. When the customer enters payment details, the website sends them to the server. The server sends them to PayMongo. PayMongo processes the payment and tells the server if it worked. The email service (Resend) is another external company that sends emails. When something important happens, the server tells Resend to send an email to the customer. Resend sends the email and the customer receives it.

---

## ✨ SIMPLE SUMMARY

A customer wants to buy a lawn lot. They open the website and click "Lawn Lots." They click "Request Now" and select a payment plan. They select a purpose and fill in deceased information. Then comes the important part: they see a grid of available lots and click on one they like. The lot turns green and shows a checkmark. They confirm the selection. Then they select a payment method like credit card or GCash. They enter their payment details. PayMongo processes the payment. If successful, the customer gets a confirmation message and a confirmation email. The reservation appears in their dashboard. The admin also sees the new reservation. Everything is saved in the database. The customer can now see their lawn lot reservation anytime they log in.

---

**Last Updated:** May 10, 2026
**Status:** Complete
**Difficulty:** Super Simple
**Language:** Simple English with Tagalog Headers
