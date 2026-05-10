# Sanctuario System - Complete Screenshot Navigation Guide

## Quick Start - Where to Find Everything

### System Access URLs
- **Main Application:** `http://localhost:3000` (React Frontend)
- **API Backend:** `http://localhost:8000` (Laravel API)
- **Admin Panel:** `http://localhost:3000/admin` (if admin routes exist)

---

## CLIENT SIDE - PUBLIC & AUTHENTICATED USERS

### 1. AUTHENTICATION PAGES

#### Login Page
**URL:** `http://localhost:3000/login` or `http://localhost:3000`
**File:** `client-app/src/pages/LoginPage.jsx`
**Navigation:** Click "Sign In" on navbar
**Screenshots to Capture:**
- [ ] Full login page (desktop)
- [ ] Login form with email/password fields
- [ ] "Remember Me" checkbox
- [ ] "Forgot Password?" link
- [ ] "Create Account" link
- [ ] Login page (mobile view)
- [ ] Login page (tablet view)

#### Registration/Sign Up Page
**URL:** `http://localhost:3000/signup`
**File:** `client-app/src/pages/SignupPage.jsx`
**Navigation:** Click "Create Account" on login page or navbar
**Screenshots to Capture:**
- [ ] Full registration form (desktop)
- [ ] Full Name field
- [ ] Email field
- [ ] Phone Number field
- [ ] Password field with requirements
- [ ] Confirm Password field
- [ ] Terms & Conditions checkbox
- [ ] Privacy Policy checkbox
- [ ] "Create Account" button
- [ ] Registration page (mobile)
- [ ] Form validation errors
- [ ] Success message after registration

#### Forgot Password Page
**URL:** `http://localhost:3000/forgot-password` (via modal or link)
**File:** `client-app/src/components/ForgotPasswordModal.jsx`
**Navigation:** Click "Forgot Password?" on login page
**Screenshots to Capture:**
- [ ] Forgot password modal
- [ ] Email input field
- [ ] "Send Recovery Link" button
- [ ] Success message
- [ ] Error message (if email not found)

#### Reset Password Page
**URL:** `http://localhost:3000/reset-password?token=xxxxx`
**File:** `client-app/src/pages/ResetPasswordPage.jsx`
**Navigation:** Click link in password recovery email
**Screenshots to Capture:**
- [ ] Reset password form
- [ ] New password field
- [ ] Confirm password field
- [ ] Password requirements
- [ ] "Reset Password" button
- [ ] Success message

---

## HOME & LANDING PAGES

#### Home Page
**URL:** `http://localhost:3000/` or `http://localhost:3000/home`
**File:** `client-app/src/pages/HomePage.jsx`
**Navigation:** Click logo or "Home" in navbar
**Screenshots to Capture:**
- [ ] Full home page (desktop)
- [ ] Hero section with banner
- [ ] Featured services section
- [ ] Services grid/cards
- [ ] Call-to-action buttons
- [ ] Footer section
- [ ] Home page (mobile)
- [ ] Home page (tablet)
- [ ] Navbar with logo
- [ ] Navigation menu

#### About Page
**URL:** `http://localhost:3000/about`
**File:** `client-app/src/pages/AboutPage.jsx`
**Navigation:** Click "About" in navbar or footer
**Screenshots to Capture:**
- [ ] About page content
- [ ] Company information
- [ ] Mission/Vision section
- [ ] Team section (if available)
- [ ] About page (mobile)

#### Contact Page
**URL:** `http://localhost:3000/contact`
**File:** `client-app/src/pages/ContactPage.jsx`
**Navigation:** Click "Contact" in navbar or footer
**Screenshots to Capture:**
- [ ] Contact form (desktop)
- [ ] Full Name field
- [ ] Email field
- [ ] Phone Number field
- [ ] Subject field
- [ ] Message textarea
- [ ] Service Type dropdown
- [ ] "Submit" button
- [ ] Contact information display
- [ ] Contact page (mobile)
- [ ] Success message after submission
- [ ] Form validation errors

#### Team Page
**URL:** `http://localhost:3000/team`
**File:** `client-app/src/pages/TeamPage.jsx`
**Navigation:** Click "Team" in navbar (if available)
**Screenshots to Capture:**
- [ ] Team member cards
- [ ] Team member photos
- [ ] Team member names and titles
- [ ] Team page (mobile)

#### Terms & Conditions Page
**URL:** `http://localhost:3000/terms`
**File:** `client-app/src/pages/TermsPage.jsx`
**Navigation:** Click "Terms" in footer
**Screenshots to Capture:**
- [ ] Terms page content
- [ ] Scrollable content
- [ ] Terms page (mobile)

#### Privacy Policy Page
**URL:** `http://localhost:3000/privacy`
**File:** `client-app/src/pages/PrivacyPolicyPage.jsx`
**Navigation:** Click "Privacy Policy" in footer
**Screenshots to Capture:**
- [ ] Privacy policy content
- [ ] Scrollable content
- [ ] Privacy page (mobile)

#### Accessibility Page
**URL:** `http://localhost:3000/accessibility`
**File:** `client-app/src/pages/AccessibilityPage.jsx`
**Navigation:** Click "Accessibility" in footer (if available)
**Screenshots to Capture:**
- [ ] Accessibility information
- [ ] Accessibility features list

---

## SERVICES & PROPERTIES

#### Services Page (Public)
**URL:** `http://localhost:3000/services`
**File:** `client-app/src/pages/ServicesPage.jsx`
**Navigation:** Click "Services" in navbar
**API Endpoint:** `GET /api/public/services`
**Screenshots to Capture:**
- [ ] Services listing page (desktop)
- [ ] Service cards grid
- [ ] Service name, description, price
- [ ] Service images
- [ ] "View Details" or "Book Now" button
- [ ] Search/filter functionality
- [ ] Services page (mobile)
- [ ] Services page (tablet)
- [ ] Service sorting options

#### Service Detail Page
**URL:** `http://localhost:3000/services/{serviceId}`
**File:** `client-app/src/components/ServiceDetail.jsx`
**Navigation:** Click on a service card
**Screenshots to Capture:**
- [ ] Service detail page (desktop)
- [ ] Service images/gallery
- [ ] Service name and description
- [ ] Service price
- [ ] Service requirements section
- [ ] "Book Service" button
- [ ] Related services
- [ ] Service detail page (mobile)
- [ ] Image carousel/gallery

#### Lawn Lots Page
**URL:** `http://localhost:3000/lawn-lots`
**File:** `client-app/src/pages/LawnLotsPage.jsx`
**Navigation:** Click "Lawn Lots" in navbar or services
**API Endpoint:** `GET /api/lawn-lots`
**Screenshots to Capture:**
- [ ] Lawn lots listing (desktop)
- [ ] Lot cards with availability
- [ ] Lot location/map
- [ ] Lot price
- [ ] "Select Lot" button
- [ ] Lawn lots page (mobile)
- [ ] Lot details modal

#### Columbarium Page
**URL:** `http://localhost:3000/columbariums`
**File:** `client-app/src/pages/ColumbariumsPage.jsx`
**Navigation:** Click "Columbariums" in navbar or services
**API Endpoint:** `GET /api/columbariums`
**Screenshots to Capture:**
- [ ] Columbarium listing (desktop)
- [ ] Columbarium cards
- [ ] Availability status
- [ ] Price information
- [ ] "Select" button
- [ ] Columbarium page (mobile)

#### Family Estates Page
**URL:** `http://localhost:3000/family-estates`
**File:** `client-app/src/pages/FamilyEstatesPage.jsx`
**Navigation:** Click "Family Estates" in navbar or services
**API Endpoint:** `GET /api/family-estates`
**Screenshots to Capture:**
- [ ] Family estates listing (desktop)
- [ ] Estate cards
- [ ] Estate details
- [ ] Availability
- [ ] Family estates page (mobile)

#### Cremation Services Page
**URL:** `http://localhost:3000/cremation`
**File:** `client-app/src/pages/CremationPage.jsx`
**Navigation:** Click "Cremation" in services
**Screenshots to Capture:**
- [ ] Cremation services page
- [ ] Service details
- [ ] Pricing
- [ ] "Book Service" button

#### Internment Services Page
**URL:** `http://localhost:3000/internment`
**File:** `client-app/src/pages/InternmentPage.jsx`
**Navigation:** Click "Internment" in services
**Screenshots to Capture:**
- [ ] Internment services page
- [ ] Service details
- [ ] Pricing
- [ ] "Book Service" button

#### Properties & Services Page
**URL:** `http://localhost:3000/properties-services`
**File:** `client-app/src/pages/PropertiesServicesPage.jsx`
**Navigation:** Click "Properties & Services" in navbar
**Screenshots to Capture:**
- [ ] Combined properties and services view
- [ ] Properties section
- [ ] Services section
- [ ] Filtering options

#### Search Page
**URL:** `http://localhost:3000/search?q=keyword`
**File:** `client-app/src/pages/SearchPage.jsx`
**Navigation:** Use search functionality in navbar
**Screenshots to Capture:**
- [ ] Search results page
- [ ] Search query display
- [ ] Results list
- [ ] No results message
- [ ] Search page (mobile)

---

## AUTHENTICATED CLIENT PAGES

#### Client Dashboard
**URL:** `http://localhost:3000/dashboard` (after login)
**File:** `client-app/src/pages/HomePage.jsx` (redirects to dashboard if logged in)
**Navigation:** Automatic after login
**Screenshots to Capture:**
- [ ] Dashboard overview (desktop)
- [ ] Welcome message
- [ ] Quick stats (bookings, payments, etc.)
- [ ] Recent bookings section
- [ ] Upcoming services
- [ ] Quick action buttons
- [ ] Dashboard (mobile)
- [ ] Dashboard (tablet)

#### My Reservations Page
**URL:** `http://localhost:3000/my-reservations`
**File:** `client-app/src/pages/MyReservationsPage.jsx`
**Navigation:** Click "My Reservations" in navbar or dashboard
**API Endpoint:** `GET /api/reservations`
**Screenshots to Capture:**
- [ ] Reservations list (desktop)
- [ ] Reservation cards with status
- [ ] Reservation date/time
- [ ] Reservation details
- [ ] "View Details" button
- [ ] "Cancel Reservation" button
- [ ] Reservations page (mobile)
- [ ] Empty state (no reservations)
- [ ] Reservation status badges

#### My Services Page
**URL:** `http://localhost:3000/my-services`
**File:** `client-app/src/pages/MyServicesPage.jsx`
**Navigation:** Click "My Services" in navbar
**API Endpoint:** `GET /api/bookings/user/{userId}`
**Screenshots to Capture:**
- [ ] My services list (desktop)
- [ ] Service cards
- [ ] Service status
- [ ] Service date
- [ ] "View Details" button
- [ ] My services page (mobile)
- [ ] Empty state

#### My Purchases Page
**URL:** `http://localhost:3000/my-purchases`
**File:** `client-app/src/pages/MyPurchasesPage.jsx`
**Navigation:** Click "My Purchases" in navbar
**Screenshots to Capture:**
- [ ] Purchases list (desktop)
- [ ] Purchase items
- [ ] Purchase date
- [ ] Purchase amount
- [ ] Purchase status
- [ ] "View Receipt" button
- [ ] My purchases page (mobile)

#### Payments Page
**URL:** `http://localhost:3000/payments`
**File:** `client-app/src/pages/PaymentsPage.jsx`
**Navigation:** Click "Payments" in navbar
**API Endpoint:** `GET /api/payments`
**Screenshots to Capture:**
- [ ] Payments list (desktop)
- [ ] Payment history table
- [ ] Payment date
- [ ] Payment amount
- [ ] Payment status
- [ ] Payment method
- [ ] "Download Receipt" button
- [ ] Payments page (mobile)
- [ ] Payment filters

#### Payment Page (Checkout)
**URL:** `http://localhost:3000/payment`
**File:** `client-app/src/pages/PaymentPage.jsx`
**Navigation:** Click "Pay Now" or "Checkout"
**Screenshots to Capture:**
- [ ] Payment form (desktop)
- [ ] Order summary
- [ ] Amount to pay
- [ ] Payment method selection
- [ ] Card details form
- [ ] "Pay Now" button
- [ ] Payment page (mobile)
- [ ] Payment method options

#### Payment Success Page
**URL:** `http://localhost:3000/payment-success`
**File:** `client-app/src/pages/PaymentSuccess.jsx`
**Navigation:** Automatic after successful payment
**Screenshots to Capture:**
- [ ] Success message
- [ ] Order confirmation
- [ ] Receipt information
- [ ] "Download Receipt" button
- [ ] "Back to Dashboard" button

#### Payment Cancel Page
**URL:** `http://localhost:3000/payment-cancel`
**File:** `client-app/src/pages/PaymentCancel.jsx`
**Navigation:** Automatic if payment cancelled
**Screenshots to Capture:**
- [ ] Cancellation message
- [ ] "Retry Payment" button
- [ ] "Back to Dashboard" button

#### Billing Page
**URL:** `http://localhost:3000/billing`
**File:** `client-app/src/pages/BillingPage.jsx`
**Navigation:** Click "Billing" in navbar
**Screenshots to Capture:**
- [ ] Billing overview (desktop)
- [ ] Billing information
- [ ] Payment history table
- [ ] Outstanding balance
- [ ] "Pay Now" button
- [ ] Billing page (mobile)
- [ ] Invoice list

#### My Maintenance Requests Page
**URL:** `http://localhost:3000/my-maintenance-requests`
**File:** `client-app/src/pages/MyMaintenanceRequestsPage.jsx`
**Navigation:** Click "Maintenance Requests" in navbar
**API Endpoint:** `GET /api/maintenance-requests`
**Screenshots to Capture:**
- [ ] Maintenance requests list (desktop)
- [ ] Request cards
- [ ] Request status
- [ ] Request date
- [ ] "View Details" button
- [ ] "Create Request" button
- [ ] Maintenance page (mobile)
- [ ] Empty state

#### Maintenance Request Form
**URL:** `http://localhost:3000/maintenance`
**File:** `client-app/src/pages/MaintenancePage.jsx`
**Navigation:** Click "Create Maintenance Request"
**Screenshots to Capture:**
- [ ] Maintenance form (desktop)
- [ ] Property selection
- [ ] Issue description
- [ ] Priority level
- [ ] Attachment upload
- [ ] "Submit Request" button
- [ ] Maintenance form (mobile)
- [ ] Form validation

#### Notifications Page
**URL:** `http://localhost:3000/notifications`
**File:** `client-app/src/pages/NotificationsPage.jsx`
**Navigation:** Click bell icon in navbar
**API Endpoint:** `GET /api/notifications`
**Screenshots to Capture:**
- [ ] Notifications list (desktop)
- [ ] Notification items
- [ ] Notification date/time
- [ ] Notification type
- [ ] "Mark as Read" button
- [ ] Notifications page (mobile)
- [ ] Empty state
- [ ] Notification dropdown

#### Activity Logs Page
**URL:** `http://localhost:3000/activity-logs`
**File:** `client-app/src/pages/ActivityLogsPage.jsx`
**Navigation:** Click "Activity Logs" in settings
**API Endpoint:** `GET /api/admin/activity-logs`
**Screenshots to Capture:**
- [ ] Activity logs list
- [ ] Log entries
- [ ] Timestamp
- [ ] Action description
- [ ] Activity logs (mobile)

#### User Profile Page
**URL:** `http://localhost:3000/profile` or `http://localhost:3000/user`
**File:** `client-app/src/pages/UserPage.jsx`
**Navigation:** Click profile icon in navbar
**Screenshots to Capture:**
- [ ] Profile page (desktop)
- [ ] Profile picture
- [ ] User information
- [ ] Full name
- [ ] Email
- [ ] Phone number
- [ ] Address
- [ ] "Edit Profile" button
- [ ] "Change Password" button
- [ ] Profile page (mobile)
- [ ] Edit profile form
- [ ] Profile picture upload

---

## MODALS & COMPONENTS

#### Login Prompt Modal
**Trigger:** Try to book without logging in
**File:** `client-app/src/components/LoginPromptModal.jsx`
**Screenshots to Capture:**
- [ ] Modal overlay
- [ ] Login prompt message
- [ ] "Sign In" button
- [ ] "Create Account" button
- [ ] Close button

#### Lot Selector Modal
**Trigger:** During booking process
**File:** `client-app/src/components/LotSelector.jsx`
**Screenshots to Capture:**
- [ ] Lot selection modal
- [ ] Lot grid/list
- [ ] Lot availability status
- [ ] Lot selection
- [ ] "Confirm" button

#### Purpose Selection Modal
**Trigger:** During service booking
**File:** `client-app/src/components/PurposeSelectionModal.jsx`
**Screenshots to Capture:**
- [ ] Purpose selection modal
- [ ] Purpose options
- [ ] Description for each purpose
- [ ] "Select" button

#### Requirements Modal
**Trigger:** During booking process
**File:** `client-app/src/components/RequirementsModal.jsx`
**Screenshots to Capture:**
- [ ] Requirements display modal
- [ ] Required documents list
- [ ] Document descriptions
- [ ] "Proceed" button

#### Requirement Submission Form
**Trigger:** After booking confirmation
**File:** `client-app/src/components/RequirementSubmissionForm.jsx`
**Screenshots to Capture:**
- [ ] Requirement form
- [ ] Document upload fields
- [ ] File input
- [ ] "Submit" button
- [ ] Form validation

#### Deceased Info Modal
**Trigger:** During booking
**File:** `client-app/src/components/DeceasedInfoModal.jsx`
**Screenshots to Capture:**
- [ ] Deceased information form
- [ ] Name field
- [ ] Date of birth
- [ ] Date of death
- [ ] "Confirm" button

#### Payment Modal
**Trigger:** During checkout
**File:** `client-app/src/components/PaymentModal.jsx`
**Screenshots to Capture:**
- [ ] Payment modal
- [ ] Order summary
- [ ] Payment method selection
- [ ] Card details
- [ ] "Pay" button

#### Profile Modal
**Trigger:** Click profile icon
**File:** `client-app/src/components/ProfileModal.jsx`
**Screenshots to Capture:**
- [ ] Profile dropdown menu
- [ ] User name
- [ ] "View Profile" option
- [ ] "Settings" option
- [ ] "Logout" option

#### Search Modal
**Trigger:** Click search icon
**File:** `client-app/src/components/SearchModal.jsx`
**Screenshots to Capture:**
- [ ] Search modal
- [ ] Search input field
- [ ] Search results
- [ ] Recent searches

#### Image Modal
**Trigger:** Click on service/property image
**File:** `client-app/src/components/ImageModal.jsx`
**Screenshots to Capture:**
- [ ] Full-size image modal
- [ ] Image gallery navigation
- [ ] Previous/Next buttons
- [ ] Close button

#### Alert Modal
**Trigger:** System alerts/confirmations
**File:** `client-app/src/components/AlertModal.jsx`
**Screenshots to Capture:**
- [ ] Alert modal
- [ ] Alert message
- [ ] "OK" button
- [ ] "Cancel" button

#### Notification Dropdown
**Trigger:** Click bell icon
**File:** `client-app/src/components/NotificationDropdown.jsx`
**Screenshots to Capture:**
- [ ] Notification dropdown
- [ ] Recent notifications
- [ ] Notification count
- [ ] "View All" link

---

## NAVBAR & FOOTER

#### Navbar (Desktop)
**File:** `client-app/src/components/Navbar.jsx`
**Screenshots to Capture:**
- [ ] Full navbar (desktop)
- [ ] Logo
- [ ] Navigation menu items
- [ ] Search icon
- [ ] Notification bell
- [ ] Profile icon
- [ ] Login/Signup buttons (if not logged in)
- [ ] User menu (if logged in)

#### Navbar (Mobile)
**Screenshots to Capture:**
- [ ] Mobile navbar
- [ ] Hamburger menu
- [ ] Logo
- [ ] Search icon
- [ ] Notification bell
- [ ] Mobile menu expanded
- [ ] Mobile menu items

#### Footer
**File:** `client-app/src/components/Footer.jsx`
**Screenshots to Capture:**
- [ ] Footer section
- [ ] Company information
- [ ] Quick links
- [ ] Contact information
- [ ] Social media links
- [ ] Copyright notice
- [ ] Footer (mobile)

---

## ADMIN SIDE - ADMIN PANEL

### Access Admin Panel
**URL:** `http://localhost:3000/admin` (if admin routes exist)
**Alternative:** Check if admin is served from separate port or domain

### Admin Routes (from API)
Based on the routes file, admin features are accessed via API endpoints:

#### Admin Login
**API Endpoint:** `POST /api/admin/login`
**File:** `client-app/src/pages/LoginPage.jsx` (with admin flag)
**Screenshots to Capture:**
- [ ] Admin login page
- [ ] Admin credentials form
- [ ] Login button

#### Admin Dashboard
**API Endpoint:** `GET /api/user` (after auth)
**Accessible Routes:**
- `/admin/reservations` - Reservation management
- `/admin/payments` - Payment management
- `/admin/inquiries` - Inquiry management
- `/admin/activity-logs` - Activity logs
- `/admin/site-settings` - Site settings
- `/admin/contact-messages` - Contact messages

**Screenshots to Capture:**
- [ ] Admin dashboard overview
- [ ] Key metrics/statistics
- [ ] Recent activities
- [ ] Quick action buttons

#### User Management
**API Endpoint:** `GET /api/users`
**Screenshots to Capture:**
- [ ] Users list
- [ ] User table with columns
- [ ] User status
- [ ] Edit user button
- [ ] Delete user button
- [ ] Create user button

#### Permission Management
**API Endpoint:** `GET /api/admin-permissions/{adminId}`
**Screenshots to Capture:**
- [ ] Permissions list
- [ ] Permission checkboxes
- [ ] Role assignment
- [ ] Save button

#### Reservation Management
**API Endpoint:** `GET /api/admin/reservations`
**Screenshots to Capture:**
- [ ] Reservations list
- [ ] Reservation details
- [ ] Approve button
- [ ] Reject button
- [ ] Status updates

#### Payment Management
**API Endpoint:** `GET /api/payments` (with billing.permission middleware)
**Screenshots to Capture:**
- [ ] Payments list
- [ ] Payment table
- [ ] Payment status
- [ ] Generate receipt button
- [ ] Payment analytics

#### Inquiry Management
**API Endpoint:** `GET /api/admin/inquiries`
**Screenshots to Capture:**
- [ ] Inquiries list
- [ ] Inquiry details
- [ ] Status update
- [ ] Response form
- [ ] Delete button

#### Contact Messages
**API Endpoint:** `GET /api/admin/contact-messages`
**Screenshots to Capture:**
- [ ] Contact messages list
- [ ] Message details
- [ ] Status update
- [ ] Delete button

#### Activity Logs
**API Endpoint:** `GET /api/admin/activity-logs`
**Screenshots to Capture:**
- [ ] Activity logs list
- [ ] Log entries
- [ ] Timestamp
- [ ] User action
- [ ] Export CSV button

#### Site Settings
**API Endpoint:** `GET /api/admin/site-settings`
**Screenshots to Capture:**
- [ ] Settings form
- [ ] Email configuration
- [ ] SMS configuration
- [ ] Payment settings
- [ ] Logo upload
- [ ] Save button

#### Notifications Management
**API Endpoint:** `GET /api/admin/notifications`
**Screenshots to Capture:**
- [ ] Notifications list
- [ ] Send notification form
- [ ] Email template
- [ ] SMS template
- [ ] Recipient selection
- [ ] Send button

#### SMS Management
**API Endpoint:** `GET /api/sms/logs`
**Screenshots to Capture:**
- [ ] SMS logs
- [ ] SMS history
- [ ] Recipient
- [ ] Message content
- [ ] Status
- [ ] Send SMS form

#### Maintenance Requests
**API Endpoint:** `GET /api/maintenance-requests`
**Screenshots to Capture:**
- [ ] Maintenance requests list
- [ ] Request details
- [ ] Approve button
- [ ] Reject button
- [ ] Progress tracking
- [ ] Status updates

#### Services Management
**API Endpoint:** `GET /api/services`
**Screenshots to Capture:**
- [ ] Services list
- [ ] Service details
- [ ] Create service button
- [ ] Edit service button
- [ ] Delete service button
- [ ] Service pricing

#### Properties Management
**API Endpoint:** `GET /api/properties`
**Screenshots to Capture:**
- [ ] Properties list
- [ ] Property details
- [ ] Create property button
- [ ] Edit property button
- [ ] Availability status
- [ ] Property type

#### Clients Management
**API Endpoint:** `GET /api/clients`
**Screenshots to Capture:**
- [ ] Clients list
- [ ] Client details
- [ ] Client status
- [ ] Client history
- [ ] Edit client button

#### Bookings Management
**API Endpoint:** `GET /api/bookings`
**Screenshots to Capture:**
- [ ] Bookings list
- [ ] Booking details
- [ ] Booking status
- [ ] Update status button
- [ ] View requirements button
- [ ] Payment status

#### Requirements Management
**API Endpoint:** `GET /api/requirements`
**Screenshots to Capture:**
- [ ] Requirements list
- [ ] Create requirement button
- [ ] Edit requirement button
- [ ] Assign to service button
- [ ] Delete button

#### Payment Plans
**API Endpoint:** `GET /api/payment-plans`
**Screenshots to Capture:**
- [ ] Payment plans list
- [ ] Plan details
- [ ] Create plan button
- [ ] Edit plan button
- [ ] Installment schedule

---

## RESPONSIVE DESIGN SCREENSHOTS

### Mobile Views (375px - 480px)
For each major page, capture:
- [ ] Full page screenshot
- [ ] Hamburger menu open
- [ ] Form fields
- [ ] Buttons
- [ ] Cards/Lists

### Tablet Views (768px - 1024px)
For each major page, capture:
- [ ] Full page screenshot
- [ ] Layout adjustments
- [ ] Navigation changes
- [ ] Form layout

### Desktop Views (1024px+)
For each major page, capture:
- [ ] Full page screenshot
- [ ] Sidebar (if applicable)
- [ ] Multi-column layout
- [ ] Full navigation

---

## QUICK NAVIGATION CHECKLIST

### Public Pages (No Login Required)
- [ ] Home page
- [ ] About page
- [ ] Contact page
- [ ] Services page
- [ ] Lawn Lots page
- [ ] Columbariums page
- [ ] Family Estates page
- [ ] Cremation services
- [ ] Internment services
- [ ] Terms & Conditions
- [ ] Privacy Policy
- [ ] Accessibility page
- [ ] Team page
- [ ] Search page

### Authentication Pages
- [ ] Login page
- [ ] Registration page
- [ ] Forgot password
- [ ] Reset password

### Client Dashboard Pages (Login Required)
- [ ] Dashboard
- [ ] My Reservations
- [ ] My Services
- [ ] My Purchases
- [ ] Payments
- [ ] Billing
- [ ] Maintenance Requests
- [ ] Notifications
- [ ] Profile
- [ ] Activity Logs

### Admin Pages (Admin Login Required)
- [ ] Admin Dashboard
- [ ] User Management
- [ ] Permission Management
- [ ] Reservation Management
- [ ] Payment Management
- [ ] Inquiry Management
- [ ] Contact Messages
- [ ] Activity Logs
- [ ] Site Settings
- [ ] Notifications Management
- [ ] SMS Management
- [ ] Maintenance Requests
- [ ] Services Management
- [ ] Properties Management
- [ ] Clients Management
- [ ] Bookings Management
- [ ] Requirements Management
- [ ] Payment Plans

---

## TESTING CREDENTIALS

### Admin Account
- **Email:** admin@sanctuario.com
- **Password:** (check .env file)

### Staff Account
- **Email:** staff@sanctuario.com
- **Password:** (check .env file)

### Test Client Account
- **Email:** client@sanctuario.com
- **Password:** (check .env file)

---

## BROWSER DEVELOPER TOOLS

### Responsive Design Mode
- **Chrome/Edge:** F12 → Ctrl+Shift+M
- **Firefox:** F12 → Ctrl+Shift+M
- **Safari:** Develop → Enter Responsive Design Mode

### Device Presets
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad (768x1024)
- iPad Pro (1024x1366)
- Desktop (1920x1080)

---

## SCREENSHOT ORGANIZATION

### Folder Structure
```
Screenshots/
├── Public/
│   ├── Home/
│   ├── Services/
│   ├── Properties/
│   ├── Contact/
│   └── Auth/
├── Client/
│   ├── Dashboard/
│   ├── Reservations/
│   ├── Payments/
│   ├── Profile/
│   └── Maintenance/
├── Admin/
│   ├── Dashboard/
│   ├── Users/
│   ├── Payments/
│   ├── Bookings/
│   └── Settings/
├── Mobile/
│   ├── Public/
│   ├── Client/
│   └── Admin/
└── Tablet/
    ├── Public/
    ├── Client/
    └── Admin/
```

---

## NOTES

- All URLs assume localhost development environment
- Update URLs for production deployment
- Some admin features may require specific permissions
- Test with different user roles (Admin, Staff, Client)
- Capture both light and dark modes (if applicable)
- Include error states and validation messages
- Document any custom modals or components

---

**Document Version:** 1.0  
**Last Updated:** May 3, 2026  
**Status:** Complete
