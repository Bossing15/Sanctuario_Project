# How Sanctuario System Works - Simple Paragraph Explanation
# Paano Gumagana ang Sanctuario System - Simpleng Paliwanag

---

## 🎯 THE BASIC IDEA

Imagine Sanctuario is like a funeral home business. The system has two main sides: one for customers (clients) and one for the business owner (admin). When a customer wants to book a service, they use the client side. When the business owner wants to manage everything, they use the admin side. Both sides talk to each other through a middle part called the backend, which is like the brain of the system. The backend stores everything in a database, which is like a filing cabinet that keeps all the information safe.

---

## 🏪 WHAT EACH PART DOES

**The Frontend (Client Website):** This is what you see when you open the website. It's beautiful, colorful, and easy to use. When you click buttons or fill forms, the frontend collects your information and sends it to the backend. Think of it like the menu and ordering system at a restaurant.

**The Backend (Server):** This is the invisible part that does all the thinking. When the frontend sends information, the backend checks if everything is correct, saves it to the database, and sends back an answer. It's like the kitchen in a restaurant that prepares the food based on your order.

**The Database (Storage):** This is where all the information lives. Every booking, payment, user account, and message is stored here safely. It's like a huge filing cabinet that never forgets anything. When the backend needs information, it asks the database. When something new happens, the backend saves it to the database.

---

## 👥 HOW A CLIENT USES THE SYSTEM

**Step 1: Client Opens the Website**

A client opens their browser and goes to the Sanctuario website. The frontend loads, which means the website appears on their screen. They see the home page with information about services, prices, and how to book. This all happens on their computer, not on the server.

**Step 2: Client Browses Services**

The client clicks on "Services" to see what's available. When they click, the frontend sends a message to the backend saying "Hey, show me all the services." The backend receives this message, goes to the database, and asks "What services do we have?" The database sends back a list of all services. The backend then sends this list back to the frontend. The frontend receives it and displays all the services beautifully on the screen. The client sees all the options and can read about each one.

**Step 3: Client Creates an Account**

The client decides to book a service, so they click "Sign Up." A form appears asking for their name, email, and password. The client fills it out and clicks "Create Account." The frontend takes this information and sends it to the backend. The backend checks if the email is already used and if the password is strong enough. If everything is good, the backend saves the new account to the database. The backend also sends a confirmation email to the client's email address. The client receives the email, clicks the link to verify, and their account is now active.

**Step 4: Client Logs In**

The client goes back to the website and clicks "Login." They enter their email and password. The frontend sends this to the backend. The backend checks the database to see if the email exists and if the password matches. If it does, the backend creates a special token (like a ticket) and sends it back to the frontend. The frontend saves this token in the browser. Now the client is logged in. Every time the client does something, the frontend includes this token so the backend knows who they are.

**Step 5: Client Makes a Booking**

The client clicks "Book Service" and selects a service and date. A form appears asking for details about the deceased and any special requirements. The client fills everything out and clicks "Confirm." The frontend sends all this information plus the token to the backend. The backend checks if the client is really logged in by looking at the token. Then it checks if all the required information is there. If everything is good, the backend saves the booking to the database. The backend also sends a confirmation email to the client and a notification to the admin. The frontend receives a success message and shows "Your booking is confirmed!" on the screen. The client can now see their booking in their dashboard.

**Step 6: Client Makes a Payment**

The client clicks "Pay Now" to pay for their booking. A payment form appears. The client enters their card details. The frontend sends this to the backend. The backend doesn't keep the card information. Instead, it sends it to PayMongo, which is a payment company that handles credit cards safely. PayMongo processes the payment and tells the backend if it was successful or not. If successful, the backend updates the database to mark the payment as received. The backend sends a receipt email to the client. The frontend shows "Payment successful!" and the client's dashboard updates to show the payment is complete. The admin also sees that a payment was received.

**Step 7: Client Views Their Dashboard**

The client clicks "Dashboard" to see all their information in one place. The frontend sends a request to the backend with the client's token. The backend checks if the token is valid and belongs to this client. Then the backend goes to the database and gets all the information for this client: their bookings, payments, messages, and notifications. The backend sends all this back to the frontend. The frontend displays it nicely on the dashboard. The client can see everything they've done and the status of their bookings.

---

## 👨‍💼 HOW AN ADMIN USES THE SYSTEM

**Step 1: Admin Logs In**

The admin goes to the admin side of the website (a special URL just for admins). They enter their admin email and password. The frontend sends this to the backend. The backend checks if this person is an admin and if the password is correct. The backend also checks what permissions this admin has (maybe they can only see bookings, or maybe they can do everything). If everything is correct, the backend creates a token for the admin and sends it back. The frontend saves this token. Now the admin is logged in and can see the admin dashboard with all the controls.

**Step 2: Admin Views All Bookings**

The admin clicks "Bookings" to see all the bookings from all clients. The frontend sends a request to the backend with the admin's token. The backend checks if this person is an admin and if they have permission to see bookings. If yes, the backend goes to the database and gets all the bookings. The backend sends this list back to the frontend. The frontend displays all the bookings in a table. The admin can see who booked what, when, and what the status is.

**Step 3: Admin Approves a Booking**

The admin sees a new booking from a client. The admin reads the details and decides to approve it. The admin clicks the "Approve" button. The frontend sends a message to the backend saying "Approve booking number 123." The backend checks if the admin has permission to approve bookings. If yes, the backend updates the database to change the booking status from "pending" to "approved." The backend also sends an email to the client saying "Your booking has been approved!" The frontend updates the display to show the booking as approved. The client receives the approval email and sees the status change in their dashboard.

**Step 4: Admin Views Payments**

The admin clicks "Billing" to see all the payments. The frontend sends a request to the backend. The backend goes to the database and gets all the payments. The backend also calculates useful information like total revenue, how much is pending, and how much has been received. The backend sends all this back to the frontend. The frontend displays it in a nice table and maybe some charts. The admin can see exactly how much money has come in and what's still waiting.

**Step 5: Admin Sends SMS Messages**

The admin wants to send a message to clients about an upcoming event. The admin clicks "SMS" and types a message. The admin selects which clients should receive the message. The admin clicks "Send SMS." The frontend sends this to the backend. The backend checks if there are enough SMS credits available. If yes, the backend connects to Semaphore, which is an SMS company. The backend tells Semaphore to send the message to all the selected clients. Semaphore sends the SMS messages. The backend saves a record of this in the database. The frontend shows "SMS sent successfully!" The clients receive the SMS on their phones.

**Step 6: Admin Manages Users**

The admin clicks "Users" to see all the client accounts. The frontend sends a request to the backend. The backend gets all the users from the database and sends them back. The frontend displays them in a table. The admin can click on any user to see their details. The admin can edit their information, change their permissions, or deactivate their account. When the admin makes a change, the frontend sends it to the backend. The backend updates the database. The change takes effect immediately.

**Step 7: Admin Views Activity Logs**

The admin clicks "Activity Logs" to see what everyone has been doing. The frontend sends a request to the backend. The backend goes to the database and gets all the activity records. These records show who did what and when. The backend sends this back to the frontend. The frontend displays it as a timeline. The admin can see exactly what happened, like "Client Juan made a booking at 2:30 PM" or "Admin Maria approved a payment at 3:15 PM." This helps the admin keep track of everything.

---

## 🔄 HOW THEY COMMUNICATE

**The Communication Method:**

The frontend and backend don't talk like people. They use a special language called JSON. When the frontend wants something, it sends a message in JSON format. The backend reads this message, does what it asks, and sends back a response in JSON format. The frontend reads the response and shows the result to the user.

**Example of a Request:**

When a client clicks "Book Service," the frontend creates a message that says something like: "I want to create a booking. The user ID is 123. The service ID is 456. The date is May 15, 2026. Here's my token to prove I'm logged in."

**Example of a Response:**

The backend receives this and checks everything. If it's all good, it sends back a message that says: "Success! I created your booking. Your booking ID is 789. The status is pending. I sent you a confirmation email."

**How It Happens:**

The frontend sends the request over the internet to the backend. The backend receives it, processes it, and sends back a response. This all happens very fast, usually in less than a second. The frontend receives the response and shows the result to the user.

---

## 🔐 HOW THE SYSTEM KNOWS WHO YOU ARE

**The Token System:**

When you log in, the backend creates a special code called a token. This token is like a ticket that proves you're logged in. The frontend saves this token in the browser. Every time you do something, the frontend includes this token in the message to the backend. The backend checks if the token is real and if it belongs to you. If the token is valid, the backend knows it's really you and processes your request. If the token is missing or fake, the backend rejects the request and tells you to log in again.

**Why This Is Secure:**

The token is unique to you and expires after a certain time. Even if someone steals your token, they can only use it for a limited time. The backend also checks what permissions you have. So even if someone logs in as you, they can only do what you're allowed to do. If you're a client, you can only see your own bookings. If you're an admin, you can see everything (depending on your permissions).

---

## 📧 HOW EMAILS AND SMS WORK

**Sending Emails:**

When something important happens, like a booking confirmation or a payment receipt, the backend creates an email. The backend doesn't send the email itself. Instead, it connects to an email service called Resend. The backend tells Resend "Send this email to this person." Resend sends the email. The client receives it in their inbox. This way, the system doesn't have to worry about email servers. Resend handles all that.

**Sending SMS:**

When the admin wants to send an SMS message, the backend connects to an SMS service called Semaphore. The backend tells Semaphore "Send this message to these phone numbers." Semaphore sends the SMS messages. The clients receive them on their phones. Just like with email, the system doesn't handle SMS directly. Semaphore does it for us.

---

## 💳 HOW PAYMENTS WORK

**The Payment Process:**

When a client wants to pay, they enter their card details in the payment form. The frontend sends this to the backend. The backend doesn't save the card information. Instead, it immediately sends it to PayMongo, which is a payment company. PayMongo processes the payment securely. PayMongo tells the backend if the payment was successful or if it failed. If successful, the backend updates the database to mark the payment as received. The backend sends a receipt email to the client. If it failed, the backend tells the frontend to show an error message. This way, the system never stores card information, which is much safer.

---

## 🔄 REAL-TIME UPDATES

**How the Admin Sees New Bookings Immediately:**

The admin dashboard doesn't wait for someone to refresh the page. Instead, the frontend automatically asks the backend for new information every few seconds. The backend checks the database for any new bookings. If there are new bookings, the backend sends them back. The frontend receives them and updates the display. So the admin sees new bookings appear on their screen without having to do anything. It's like magic, but it's really just the frontend asking for updates regularly.

---

## 🎯 COMPLETE EXAMPLE: A Client Books and Pays

**1:00 PM - Client Opens Website**

A client named Maria opens the Sanctuario website. The frontend loads and shows the home page. Maria can see information about services and prices.

**1:05 PM - Maria Browses Services**

Maria clicks "Services." The frontend sends a request to the backend. The backend gets all services from the database and sends them back. The frontend displays all the services. Maria reads about each one and decides she wants to book a service.

**1:10 PM - Maria Creates an Account**

Maria clicks "Sign Up." She fills in her name, email, and password. She clicks "Create Account." The frontend sends this to the backend. The backend saves her account to the database and sends her a confirmation email. Maria receives the email, clicks the link, and her account is verified.

**1:15 PM - Maria Logs In**

Maria goes back to the website and logs in with her email and password. The backend checks her credentials, creates a token, and sends it back. Maria is now logged in.

**1:20 PM - Maria Makes a Booking**

Maria clicks "Book Service." She selects a service and a date. She fills in details about the deceased and any special requirements. She clicks "Confirm." The frontend sends all this to the backend with her token. The backend saves the booking to the database. The backend sends Maria a confirmation email and notifies the admin. The frontend shows "Booking confirmed!" Maria can see her booking in her dashboard.

**1:25 PM - Admin Sees the Booking**

The admin's dashboard automatically refreshes. The admin sees a new booking from Maria. The admin reads the details and clicks "Approve." The backend updates the database. Maria receives an email saying her booking is approved.

**2:00 PM - Maria Makes a Payment**

Maria clicks "Pay Now." She enters her card details. The frontend sends this to the backend. The backend sends it to PayMongo. PayMongo processes the payment. PayMongo tells the backend it was successful. The backend updates the database. The backend sends Maria a receipt email. The frontend shows "Payment successful!" Maria's dashboard updates to show the payment is complete.

**2:05 PM - Admin Sees the Payment**

The admin's dashboard refreshes. The admin sees that Maria's payment was received. The admin marks it as confirmed. Everything is complete!

---

## 🎓 KEY TAKEAWAYS

**The Three Main Parts:**

1. **Frontend** - What you see and interact with (the website)
2. **Backend** - The invisible brain that processes everything
3. **Database** - The storage that keeps all the information

**How They Work Together:**

1. You do something on the frontend (click a button, fill a form)
2. The frontend sends a request to the backend
3. The backend processes it and talks to the database
4. The backend sends a response back to the frontend
5. The frontend shows you the result

**Admin and Client Communication:**

The admin and client don't talk directly. They both use the same system. When a client makes a booking, the backend saves it to the database. When the admin checks bookings, the backend gets them from the database and shows them to the admin. When the admin approves a booking, the backend updates the database. When the client checks their dashboard, the backend gets the updated information and shows it to the client. Everything goes through the backend and database.

**Security:**

The system uses tokens to know who you are. Every request includes your token. The backend checks if the token is valid before processing your request. This keeps your information safe and makes sure only you can see your data.

**External Services:**

The system uses other companies to handle emails (Resend), SMS (Semaphore), and payments (PayMongo). This makes the system more reliable and secure. The backend just tells these services what to do, and they handle it.

---

## ✅ SUMMARY IN ONE PARAGRAPH

Sanctuario is a system with two sides: client and admin. When a client opens the website, they see the frontend, which is the beautiful interface. When they do something like book a service or make a payment, the frontend sends a request to the backend. The backend is the brain that processes everything. It checks if the request is valid, saves information to the database (which is like a filing cabinet), and sends back a response. The frontend receives the response and shows the result to the client. The admin uses the same system but sees different information. The admin can see all bookings, payments, and users. When the admin approves something, the backend updates the database, and the client sees the change in their dashboard. Everything is connected through the backend and database. External services like PayMongo handle payments, Resend handles emails, and Semaphore handles SMS. The system uses tokens to know who you are and keeps everything secure.

---

**Last Updated:** May 10, 2026
**Status:** Complete
**Difficulty Level:** Beginner-Friendly
**Language:** Simple English with Tagalog Headers
