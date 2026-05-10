# How Sanctuario Works - Very Simple Explanation
# Paano Gumagana ang Sanctuario - Napakasimpleng Paliwanag

---

## 🎯 WHAT IS SANCTUARIO?

Sanctuario is a website where people can book funeral services. It has two parts:
- **Client side** - For customers to book services
- **Admin side** - For the business owner to manage everything

---

## 🏗️ THE THREE PARTS OF THE SYSTEM

**1. Website (Frontend)**
This is what you see. It's colorful and easy to use. You click buttons and fill forms here.

**2. Server (Backend)**
This is the invisible brain. It receives your requests, thinks about them, and sends back answers.

**3. Storage (Database)**
This is where everything is saved. All bookings, payments, and user information live here.

---

## 👥 HOW A CLIENT USES IT

**Step 1: Open Website**
Client opens browser → Sees the website → Reads about services

**Step 2: Sign Up**
Client clicks "Sign Up" → Fills name, email, password → Clicks "Create Account" → Account is created

**Step 3: Log In**
Client enters email and password → Clicks "Login" → Now logged in

**Step 4: Book Service**
Client clicks "Book Service" → Selects service and date → Fills details → Clicks "Confirm" → Booking is saved

**Step 5: Pay**
Client clicks "Pay Now" → Enters card details → Clicks "Pay" → Payment is processed → Payment is saved

**Step 6: Check Dashboard**
Client clicks "Dashboard" → Sees all their bookings and payments → Can track everything

---

## 👨‍💼 HOW AN ADMIN USES IT

**Step 1: Log In**
Admin enters email and password → Clicks "Login" → Admin dashboard appears

**Step 2: View Bookings**
Admin clicks "Bookings" → Sees all client bookings → Can read details

**Step 3: Approve Booking**
Admin sees a booking → Clicks "Approve" → Booking status changes to approved → Client gets email

**Step 4: View Payments**
Admin clicks "Billing" → Sees all payments → Sees how much money came in

**Step 5: Send SMS**
Admin clicks "SMS" → Types message → Selects clients → Clicks "Send" → Clients get SMS

**Step 6: Manage Users**
Admin clicks "Users" → Sees all clients → Can edit or deactivate accounts

---

## 🔄 HOW THEY TALK TO EACH OTHER

**Simple Process:**

1. Client clicks something on the website
2. Website sends a message to the server
3. Server receives the message
4. Server checks the storage (database)
5. Server sends back an answer
6. Website shows the answer to the client

**Example:**

Client clicks "Book Service"
↓
Website sends: "I want to book a service"
↓
Server receives it
↓
Server saves it to storage
↓
Server sends back: "Booking saved!"
↓
Website shows: "Your booking is confirmed!"

---

## 🔐 HOW THE SYSTEM KNOWS WHO YOU ARE

When you log in, the server gives you a special code (token). This code proves you are logged in. Every time you do something, the website includes this code. The server checks the code and knows it's really you. If the code is missing or wrong, the server says "You are not logged in."

---

## 📧 HOW EMAILS WORK

When something happens (like a booking confirmation), the server sends an email. The server doesn't send it directly. It tells an email company (Resend) to send it. Resend sends the email to the client. The client receives it in their inbox.

---

## 📱 HOW SMS WORKS

When the admin sends an SMS, the server tells an SMS company (Semaphore) to send it. Semaphore sends the SMS to the client's phone. The client receives the message.

---

## 💳 HOW PAYMENTS WORK

When a client pays, they enter their card details. The website sends it to the server. The server doesn't save the card. Instead, it tells a payment company (PayMongo) to process it. PayMongo processes the payment. PayMongo tells the server if it worked or not. If it worked, the server saves the payment to storage. The client gets a receipt email.

---

## 🎯 COMPLETE EXAMPLE

**1:00 PM - Maria Opens Website**
Maria opens the website. She sees the home page.

**1:05 PM - Maria Signs Up**
Maria clicks "Sign Up". She fills in her name, email, and password. She clicks "Create Account". The server saves her account. Maria gets a confirmation email. She clicks the link to verify.

**1:10 PM - Maria Logs In**
Maria logs in with her email and password. The server checks if she's real. The server gives her a token. Maria is now logged in.

**1:15 PM - Maria Books a Service**
Maria clicks "Book Service". She selects a service and date. She fills in details. She clicks "Confirm". The server saves the booking. Maria gets a confirmation email. The admin gets a notification.

**1:20 PM - Admin Sees the Booking**
The admin sees a new booking from Maria. The admin reads it. The admin clicks "Approve". The server updates the booking. Maria gets an email saying "Your booking is approved!"

**1:30 PM - Maria Pays**
Maria clicks "Pay Now". She enters her card details. The server sends it to PayMongo. PayMongo processes it. PayMongo says "Success!" The server saves the payment. Maria gets a receipt email.

**1:35 PM - Admin Sees the Payment**
The admin sees that Maria paid. The admin marks it as confirmed. Done!

---

## ✅ SUMMARY

**Three parts:**
1. Website - What you see
2. Server - The brain
3. Storage - Where data lives

**How it works:**
1. You do something on the website
2. Website tells the server
3. Server saves it to storage
4. Server tells the website
5. Website shows you the result

**Admin and Client:**
- Both use the same system
- Client books and pays
- Admin approves and manages
- Everything goes through the server and storage

**Security:**
- You get a token when you log in
- Token proves you are logged in
- Only you can see your data

**External Help:**
- Resend sends emails
- Semaphore sends SMS
- PayMongo processes payments

---

**Last Updated:** May 10, 2026
**Status:** Complete
**Difficulty:** Super Simple
