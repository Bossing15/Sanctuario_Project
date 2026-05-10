# How Sanctuario System Works - Simple Explanation
# Paano Gumagana ang Sanctuario System

---

## 🏗️ SYSTEM ARCHITECTURE (Simple Overview)

The Sanctuario system has 3 main parts:

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET/BROWSER                      │
└─────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Client Website)                   │
│         http://localhost:3000 (React)                   │
│  - What users see and interact with                     │
│  - Beautiful interface                                  │
│  - Forms, buttons, pages                                │
└─────────────────────────────────────────────────────────┘
                          ↕️
                    (API Requests)
                          ↕️
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Server/API)                        │
│         http://localhost:8000 (Laravel)                 │
│  - Processes requests                                   │
│  - Handles business logic                               │
│  - Manages data                                         │
└─────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────┐
│              DATABASE (Data Storage)                     │
│              MySQL/MariaDB                              │
│  - Stores all information                               │
│  - Users, bookings, payments, etc.                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 HOW CLIENT AND ADMIN COMMUNICATE

### **Simple Explanation:**

Think of it like a restaurant:
- **Client** = Customer ordering food
- **Admin** = Restaurant manager
- **Frontend** = Menu and ordering system
- **Backend** = Kitchen
- **Database** = Storage/inventory

---

## 📱 CLIENT SIDE FLOW (Step by Step)

### **Step 1: Client Opens Website**
```
1. Client opens browser
2. Types: https://www.sanctuario.com
3. Frontend loads (React website)
4. Client sees: Home page, Services, Contact
```

### **Step 2: Client Browses Services (No Login)**
```
1. Client clicks "Services"
2. Frontend sends request to Backend: "Get all services"
3. Backend queries Database: "Give me all services"
4. Database returns: List of services
5. Backend sends to Frontend: Service data
6. Frontend displays: Beautiful service cards
7. Client sees: All available services
```

### **Step 3: Client Creates Account**
```
1. Client clicks "Sign Up"
2. Client fills form:
   - Name: "Juan Dela Cruz"
   - Email: "juan@email.com"
   - Password: "SecurePass123"
3. Client clicks "Create Account"
4. Frontend sends to Backend: User data
5. Backend validates: Email not used? Password strong?
6. Backend creates: New user in Database
7. Backend sends: Confirmation email
8. Client receives: Email verification link
9. Client clicks: Verification link
10. Account activated!
```

### **Step 4: Client Logs In**
```
1. Client clicks "Login"
2. Client enters: Email and password
3. Frontend sends to Backend: Login credentials
4. Backend checks Database: Is email correct? Is password correct?
5. If correct:
   - Backend creates: Session/Token
   - Backend sends: Token to Frontend
   - Frontend saves: Token in browser
   - Frontend redirects: To dashboard
6. If wrong:
   - Backend sends: Error message
   - Frontend shows: "Invalid credentials"
```

### **Step 5: Client Makes Reservation**
```
1. Client clicks "Book Service"
2. Client selects: Service and date
3. Frontend shows: Confirmation form
4. Client fills: Deceased info, requirements
5. Client clicks "Confirm Booking"
6. Frontend sends to Backend: Booking data + Token
7. Backend checks: Is user logged in? (using token)
8. Backend validates: All required fields filled?
9. Backend creates: Booking in Database
10. Backend sends: Confirmation email to client
11. Frontend shows: "Booking confirmed!"
12. Admin receives: Notification of new booking
```

### **Step 6: Client Makes Payment**
```
1. Client clicks "Pay Now"
2. Frontend shows: Payment form
3. Client enters: Card details
4. Frontend sends to Backend: Payment data
5. Backend connects to: PayMongo (payment gateway)
6. PayMongo processes: Payment
7. PayMongo returns: Success/Failure
8. Backend updates Database: Payment status
9. Backend sends: Receipt email
10. Frontend shows: "Payment successful!"
11. Admin sees: Payment received
```

### **Step 7: Client Views Dashboard**
```
1. Client clicks "Dashboard"
2. Frontend sends to Backend: "Get my data" + Token
3. Backend checks: Is this user logged in?
4. Backend queries Database: Get this user's:
   - Bookings
   - Payments
   - Reservations
   - Notifications
5. Backend sends: All user data
6. Frontend displays: Dashboard with all info
7. Client sees: Their bookings, payments, etc.
```

---

## 👨‍💼 ADMIN SIDE FLOW (Step by Step)

### **Step 1: Admin Logs In**
```
1. Admin goes to: https://www.sanctuario.com/admin
2. Admin enters: Admin email and password
3. Frontend sends to Backend: Admin credentials
4. Backend checks Database: Is this admin? Is password correct?
5. Backend checks: What permissions does this admin have?
6. Backend creates: Admin session/token
7. Frontend redirects: To admin dashboard
8. Admin sees: Dashboard with all controls
```

### **Step 2: Admin Views All Bookings**
```
1. Admin clicks "Bookings"
2. Frontend sends to Backend: "Get all bookings" + Admin token
3. Backend checks: Is this user admin? Do they have permission?
4. Backend queries Database: Get all bookings
5. Backend returns: List of all bookings
6. Frontend displays: Table with all bookings
7. Admin sees: All client bookings
```

### **Step 3: Admin Approves Booking**
```
1. Admin sees: New booking from Juan
2. Admin clicks: "Approve" button
3. Frontend sends to Backend: "Approve booking #123" + Admin token
4. Backend checks: Is this admin? Do they have permission?
5. Backend updates Database: Booking status = "Approved"
6. Backend sends: Email to client "Your booking approved!"
7. Backend sends: Notification to admin
8. Frontend updates: Shows booking as approved
9. Client receives: Approval email
```

### **Step 4: Admin Views Payments**
```
1. Admin clicks "Billing"
2. Frontend sends to Backend: "Get all payments" + Admin token
3. Backend queries Database: Get all payments
4. Backend calculates: Total revenue, pending payments, etc.
5. Backend returns: Payment data
6. Frontend displays: Payment table and charts
7. Admin sees: All financial information
```

### **Step 5: Admin Sends SMS Notification**
```
1. Admin clicks "SMS"
2. Admin types: Message to send
3. Admin selects: Clients to send to
4. Admin clicks: "Send SMS"
5. Frontend sends to Backend: SMS data + Admin token
6. Backend checks: Do we have SMS credits?
7. Backend connects to: Semaphore (SMS provider)
8. Semaphore sends: SMS to clients
9. Backend updates Database: SMS log
10. Frontend shows: "SMS sent successfully!"
11. Clients receive: SMS message
```

### **Step 6: Admin Manages Users**
```
1. Admin clicks "Users"
2. Frontend sends to Backend: "Get all users" + Admin token
3. Backend queries Database: Get all users
4. Backend returns: User list
5. Frontend displays: User table
6. Admin can:
   - View user details
   - Edit user info
   - Change permissions
   - Deactivate user
7. Each action sends: Request to Backend
8. Backend updates: Database
9. Frontend updates: Display
```

### **Step 7: Admin Views Activity Logs**
```
1. Admin clicks "Activity Logs"
2. Frontend sends to Backend: "Get activity logs" + Admin token
3. Backend queries Database: Get all activities
4. Backend returns: Log entries
5. Frontend displays: Activity timeline
6. Admin sees: Who did what and when
```

---

## 🔗 HOW THEY COMMUNICATE (Technical)

### **Communication Method: API (Application Programming Interface)**

Think of API like a waiter in a restaurant:
- **Client** = Customer
- **API** = Waiter
- **Backend** = Kitchen
- **Database** = Storage

**Process:**
```
Client: "I want to book a service"
  ↓
Frontend: Sends request to Backend API
  ↓
Backend: Receives request, processes it
  ↓
Database: Stores the booking
  ↓
Backend: Sends response back
  ↓
Frontend: Receives response, shows result
  ↓
Client: Sees "Booking confirmed!"
```

### **Request Format (JSON)**
```json
{
  "action": "create_booking",
  "user_id": 123,
  "service_id": 456,
  "date": "2026-05-15",
  "token": "abc123xyz"
}
```

### **Response Format (JSON)**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking_id": 789,
  "data": {
    "status": "pending",
    "date": "2026-05-15"
  }
}
```

---

## 🔐 SECURITY & AUTHENTICATION

### **How System Knows Who You Are:**

```
1. Client logs in with email/password
2. Backend verifies credentials
3. Backend creates: Token (like a ticket)
4. Frontend stores: Token in browser
5. Every request includes: Token
6. Backend checks: Is token valid?
7. Backend checks: Does token belong to this user?
8. Backend checks: Does user have permission?
9. If all good: Process request
10. If not: Reject request
```

### **Token Example:**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(This proves you are logged in)
```

---

## 📊 DATA FLOW DIAGRAM

### **Client Making a Booking:**

```
┌─────────────┐
│   CLIENT    │
│  (Browser)  │
└──────┬──────┘
       │ 1. Clicks "Book Service"
       ↓
┌─────────────────────────────┐
│   FRONTEND (React)          │
│  - Shows booking form       │
│  - Collects user input      │
└──────┬──────────────────────┘
       │ 2. Sends booking data + token
       ↓
┌─────────────────────────────┐
│   BACKEND (Laravel API)     │
│  - Validates data           │
│  - Checks permissions       │
│  - Processes booking        │
└──────┬──────────────────────┘
       │ 3. Saves to database
       ↓
┌─────────────────────────────┐
│   DATABASE (MySQL)          │
│  - Stores booking info      │
│  - Returns confirmation     │
└──────┬──────────────────────┘
       │ 4. Returns success
       ↓
┌─────────────────────────────┐
│   BACKEND (Laravel API)     │
│  - Sends confirmation email │
│  - Notifies admin           │
│  - Returns response         │
└──────┬──────────────────────┘
       │ 5. Sends response
       ↓
┌─────────────────────────────┐
│   FRONTEND (React)          │
│  - Shows success message    │
│  - Updates dashboard        │
└──────┬──────────────────────┘
       │ 6. Displays to user
       ↓
┌─────────────┐
│   CLIENT    │
│  Sees: "Booking confirmed!" │
└─────────────┘
```

---

## 🔄 REAL-TIME UPDATES

### **How Admin Sees New Bookings Immediately:**

```
1. Client makes booking
2. Backend saves to Database
3. Backend sends notification
4. Admin dashboard refreshes (every 5 seconds)
5. Frontend requests: "Any new bookings?"
6. Backend returns: New bookings
7. Frontend updates: Shows new booking
8. Admin sees: New booking appears
```

---

## 📧 EMAIL & SMS INTEGRATION

### **How Emails Are Sent:**

```
1. Client makes booking
2. Backend creates: Email content
3. Backend connects to: Email service (Resend)
4. Email service sends: Email to client
5. Client receives: Confirmation email
```

### **How SMS Are Sent:**

```
1. Admin sends SMS
2. Backend creates: SMS message
3. Backend connects to: SMS service (Semaphore)
4. SMS service sends: SMS to client
5. Client receives: SMS message
```

---

## 🎯 COMPLETE WORKFLOW EXAMPLE

### **Scenario: Client Books Service and Pays**

```
TIME 1:00 PM - Client Action
├─ Client opens website
├─ Browses services
├─ Clicks "Book Service"
└─ Fills booking form

TIME 1:05 PM - Frontend Processing
├─ Validates form data
├─ Sends to Backend API
└─ Waits for response

TIME 1:06 PM - Backend Processing
├─ Receives booking request
├─ Checks user is logged in
├─ Validates all data
├─ Saves to Database
├─ Sends confirmation email
├─ Notifies admin
└─ Returns success response

TIME 1:07 PM - Frontend Display
├─ Receives success response
├─ Shows "Booking confirmed!"
├─ Updates dashboard
└─ Shows booking details

TIME 1:08 PM - Client Sees Result
├─ Sees confirmation message
├─ Receives confirmation email
└─ Booking appears in dashboard

TIME 1:10 PM - Admin Notification
├─ Admin sees new booking notification
├─ Admin reviews booking
├─ Admin clicks "Approve"
└─ Backend updates status

TIME 1:15 PM - Client Payment
├─ Client clicks "Pay Now"
├─ Enters payment details
├─ Frontend sends to Backend
├─ Backend connects to PayMongo
├─ Payment processed
├─ Database updated
├─ Receipt email sent
└─ Client sees "Payment successful!"

TIME 1:20 PM - Admin Sees Payment
├─ Admin dashboard refreshes
├─ Admin sees payment received
├─ Admin marks as confirmed
└─ System complete!
```

---

## 🔑 KEY CONCEPTS

### **Frontend (Client Side)**
- What users see
- React website
- Runs in browser
- Sends requests to Backend
- Displays responses

### **Backend (Server Side)**
- Processes requests
- Laravel API
- Runs on server
- Connects to Database
- Sends responses

### **Database**
- Stores all data
- MySQL/MariaDB
- Organized tables
- Secure storage
- Backup copies

### **API**
- Communication method
- Frontend talks to Backend
- Uses HTTP requests
- Sends/receives JSON
- Like a waiter

### **Token**
- Proves you're logged in
- Sent with every request
- Checked by Backend
- Expires after time
- Like a ticket

---

## ✅ SUMMARY

**How it works:**

1. **Client opens website** → Frontend loads
2. **Client interacts** → Frontend sends request
3. **Backend receives** → Processes request
4. **Database stores** → Saves data
5. **Backend responds** → Sends data back
6. **Frontend displays** → Shows result
7. **Client sees** → Beautiful interface

**Admin and Client communicate through:**
- Frontend (what they see)
- Backend API (how they talk)
- Database (where data lives)
- Email/SMS (notifications)

**It's like:**
- Client = Customer
- Frontend = Menu
- Backend = Kitchen
- Database = Storage
- Admin = Manager

---

**Last Updated:** May 3, 2026
**Status:** Complete
