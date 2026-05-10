# Sanctuario System - Complete Documentation Guide

## Table of Contents
1. [Web Main Modules](#web-main-modules)
2. [Accessing the System](#accessing-the-system)
3. [Users & Control Access](#users--control-access)
4. [System Requirements](#system-requirements)
5. [Device Requirements](#device-requirements)
6. [Contact Services](#contact-services)
7. [Installation Process](#installation-process)
8. [Maintenance Period/Duration](#maintenance-periodduration)
9. [User Account Guide](#user-account-guide)
10. [System Modules Guide](#system-modules-guide)

---

## Web Main Modules

### 1. **Authentication Module**
- User login/registration
- Password recovery
- Session management
- Remember me functionality
- Multi-user authentication (Admin, Staff, Client)

### 2. **Admin Dashboard Module**
- System overview and analytics
- User management
- Permission management
- Activity logging
- System settings configuration

### 3. **Property Management Module**
- Property listing and management
- Property types (Lawn Lot, Columbarium, etc.)
- Property availability tracking
- Property service association

### 4. **Service Management Module**
- Service creation and management
- Service pricing
- Service availability
- Service requirements
- Service reservations

### 5. **Booking & Reservation Module**
- Service reservations
- Booking authorization
- Booking status tracking
- Booking history

### 6. **Payment & Billing Module**
- Payment processing
- Invoice generation
- Billing history
- Payment plans
- Transaction tracking

### 7. **Client Management Module**
- Client profile management
- Client status tracking
- Client activity history
- Client communication

### 8. **Notification System**
- Email notifications
- SMS notifications
- In-app notifications
- Notification preferences

### 9. **Inquiry & Contact Module**
- Contact message handling
- Inquiry management
- Customer support

### 10. **Maintenance Request Module**
- Maintenance request creation
- Request status tracking
- Request history

---

## Accessing the System

### Admin Access
**URL:** `https://your-domain.com/admin`
- Navigate to the admin login page
- Enter admin credentials
- Access admin dashboard

### Staff Access
**URL:** `https://your-domain.com/staff` (if applicable)
- Navigate to staff login page
- Enter staff credentials
- Access staff dashboard

### Client Access
**URL:** `https://your-domain.com` or `https://your-domain.com/client`
- Navigate to client login page
- Enter client credentials
- Access client dashboard

### Guest Access
**URL:** `https://your-domain.com`
- Browse public pages
- View services and properties
- Access contact information
- Submit inquiries

---

## Users & Control Access

### User Roles & Permissions

#### **1. Admin**
**Permissions:**
- Full system access
- User management (create, edit, delete)
- Permission management
- System settings configuration
- Activity log viewing
- Payment management
- Report generation
- SMS/Email notification management

**Access Areas:**
- Admin Dashboard
- User Management
- Permission Management
- System Settings
- Activity Logs
- Payment Management
- Notification Management

#### **2. Staff**
**Permissions:**
- Limited system access
- Booking management
- Client management
- Service management (view/edit)
- Maintenance request handling
- Notification sending
- Report viewing

**Access Areas:**
- Staff Dashboard
- Booking Management
- Client Management
- Service Management
- Maintenance Requests
- Notifications

#### **3. Client**
**Permissions:**
- Personal profile management
- Service browsing
- Booking/Reservation creation
- Payment processing
- Notification viewing
- Account settings

**Access Areas:**
- Client Dashboard
- Service Catalog
- Booking Management
- Payment History
- Profile Settings
- Notifications

#### **4. Guest**
**Permissions:**
- Public page viewing
- Service browsing
- Inquiry submission
- Contact information access

**Access Areas:**
- Home Page
- Service Listings
- Contact Page
- About Page

---

## System Requirements

### Backend Requirements
- **Server:** Linux/Windows Server
- **PHP Version:** 8.0 or higher
- **Database:** MySQL 5.7+ or MariaDB 10.3+
- **Web Server:** Apache 2.4+ or Nginx 1.18+
- **Memory:** Minimum 2GB RAM
- **Storage:** Minimum 10GB free space
- **Processor:** Dual-core processor or higher

### Frontend Requirements
- **Node.js:** 14.0 or higher
- **npm:** 6.0 or higher
- **React:** 18.0+
- **Build Tool:** Vite

### Additional Services
- **Email Service:** SMTP server or Resend API
- **SMS Service:** SMS gateway (e.g., Semaphore)
- **File Storage:** Local or cloud storage (AWS S3, etc.)

---

## Device Requirements

### Desktop/Laptop
- **Minimum Resolution:** 1024x768px
- **Recommended Resolution:** 1920x1080px or higher
- **Browsers Supported:**
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **RAM:** 4GB minimum
- **Internet Speed:** 5 Mbps minimum

### Tablet
- **Minimum Resolution:** 768x1024px
- **Recommended Resolution:** 1024x1366px or higher
- **Browsers Supported:**
  - iOS Safari 14+
  - Chrome Mobile 90+
  - Firefox Mobile 88+
- **RAM:** 2GB minimum
- **Internet Speed:** 3 Mbps minimum

### Mobile Phone
- **Minimum Resolution:** 375x667px (iPhone SE)
- **Recommended Resolution:** 390x844px or higher
- **Browsers Supported:**
  - iOS Safari 14+
  - Chrome Mobile 90+
  - Samsung Internet 14+
- **RAM:** 2GB minimum
- **Internet Speed:** 2 Mbps minimum
- **Operating System:** iOS 14+ or Android 8+

### Responsive Breakpoints
- **Desktop:** 1024px and above
- **Tablet:** 768px - 1023px
- **Mobile:** Below 768px
- **Small Mobile:** Below 480px

---

## Contact Services

### Contact Information Form Fields
1. **Full Name** (Required)
   - Text input
   - Minimum 2 characters
   - Maximum 100 characters

2. **Email Address** (Required)
   - Email input
   - Valid email format required
   - Used for response communication

3. **Contact Number** (Required)
   - Phone input
   - Format: +63 9XX XXX XXXX (Philippines)
   - Minimum 10 digits
   - Used for SMS/Call communication

### Additional Contact Fields
4. **Subject** (Optional)
   - Text input
   - Maximum 200 characters

5. **Message** (Required)
   - Text area
   - Minimum 10 characters
   - Maximum 5000 characters

6. **Service Type** (Optional)
   - Dropdown selection
   - Options: Burial, Cremation, Maintenance, etc.

### Contact Submission Process
1. User fills out contact form
2. Form validation occurs
3. Data is stored in database
4. Confirmation email sent to user
5. Admin notification sent
6. Admin reviews and responds

### Response Timeline
- **Initial Response:** Within 24 hours
- **Resolution:** Within 3-5 business days

---

## Installation Process

### For Admin (Server Setup)

#### Step 1: Prerequisites Installation
```bash
# Install PHP 8.0+
# Install MySQL 5.7+
# Install Node.js 14+
# Install Composer
# Install Git
```

#### Step 2: Clone Repository
```bash
git clone https://github.com/your-repo/sanctuario.git
cd sanctuario
```

#### Step 3: Backend Setup
```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create database
mysql -u root -p -e "CREATE DATABASE sanctuario;"

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Create storage link
php artisan storage:link
```

#### Step 4: Frontend Setup
```bash
# Navigate to client app
cd client-app

# Install dependencies
npm install

# Build for production
npm run build

# Return to root
cd ..
```

#### Step 5: Configuration
- Update `.env` file with database credentials
- Configure email service (SMTP or Resend)
- Configure SMS service (Semaphore API)
- Set up file storage
- Configure payment gateway

#### Step 6: Start Services
```bash
# Start Laravel development server
php artisan serve

# In another terminal, start frontend (if needed)
cd client-app
npm run dev
```

#### Step 7: Verify Installation
- Access admin panel: `http://localhost:8000/admin`
- Login with default admin credentials
- Verify all modules are accessible

---

### For Staff (Access Setup)

#### Step 1: Account Creation
- Admin creates staff account in User Management
- Assign appropriate permissions
- Set initial password

#### Step 2: First Login
1. Navigate to staff login page
2. Enter provided credentials
3. Change password on first login
4. Complete profile setup

#### Step 3: Permission Configuration
- Admin assigns specific permissions
- Configure access levels
- Set module access rights

#### Step 4: Training
- Review staff dashboard
- Learn booking management
- Understand client management
- Learn notification system

---

### For Client/Normal User (Account Setup)

#### Step 1: Account Creation
1. Navigate to client registration page
2. Fill in registration form:
   - Full Name
   - Email Address
   - Phone Number
   - Password
   - Confirm Password
3. Accept terms and conditions
4. Click "Create Account"

#### Step 2: Email Verification
1. Check email for verification link
2. Click verification link
3. Account is activated

#### Step 3: First Login
1. Navigate to client login page
2. Enter email and password
3. Click "Sign In"
4. Complete profile setup (optional)

#### Step 4: Explore System
- Browse available services
- View property listings
- Make reservations
- Process payments
- View booking history

---

## Maintenance Period/Duration

### System Maintenance Schedule

#### Regular Maintenance
- **Frequency:** Weekly
- **Duration:** 2-4 hours
- **Time:** Sunday 2:00 AM - 6:00 AM (UTC+8)
- **Activities:**
  - Database optimization
  - Log cleanup
  - Cache clearing
  - Security updates

#### Monthly Maintenance
- **Frequency:** First Sunday of each month
- **Duration:** 4-6 hours
- **Time:** Sunday 12:00 AM - 6:00 AM (UTC+8)
- **Activities:**
  - Full system backup
  - Database maintenance
  - Performance optimization
  - Security patches

#### Quarterly Maintenance
- **Frequency:** Every 3 months
- **Duration:** 8 hours
- **Time:** Scheduled weekend
- **Activities:**
  - Major updates
  - Feature deployment
  - Infrastructure upgrades
  - Comprehensive testing

#### Annual Maintenance
- **Frequency:** Once per year
- **Duration:** 24 hours
- **Time:** Scheduled during low-traffic period
- **Activities:**
  - Major system upgrades
  - Database migration
  - Infrastructure overhaul
  - Comprehensive security audit

### Maintenance Notifications
- Advance notice: 7 days before scheduled maintenance
- Reminder: 24 hours before maintenance
- Status updates: During maintenance
- Completion notification: After maintenance

### Maintenance Duration Factors
- System size and complexity
- Number of active users
- Database size
- Number of transactions
- Infrastructure capacity

**Note:** Maintenance duration may vary based on Sanctuario's requirements and system complexity. This schedule is subject to change based on operational needs.

---

## User Account Guide

### 1. Account Sign-in Process

#### Desktop Sign-in
1. **Navigate to Login Page**
   - Go to `https://your-domain.com`
   - Click "Sign In" button

2. **Enter Credentials**
   - Email: Enter registered email address
   - Password: Enter account password

3. **Optional: Remember Me**
   - Check "Remember Me" to stay logged in
   - Valid for 30 days

4. **Submit**
   - Click "Sign In" button
   - Wait for authentication

5. **Access Dashboard**
   - Redirected to dashboard
   - View personalized content

#### Mobile Sign-in
1. Open app or navigate to mobile site
2. Tap "Sign In"
3. Enter email address
4. Enter password
5. Tap "Sign In"
6. Access mobile dashboard

#### Sign-in Troubleshooting
- **Incorrect Credentials:** Verify email and password
- **Account Locked:** Wait 15 minutes or use password recovery
- **Browser Issues:** Clear cache and cookies
- **Connection Issues:** Check internet connection

---

### 2. Account Recovery Process

#### Forgot Password Recovery

**Step 1: Access Recovery Page**
1. Go to login page
2. Click "Forgot Password?" link
3. Enter registered email address
4. Click "Send Recovery Link"

**Step 2: Check Email**
1. Open email inbox
2. Look for "Password Reset" email
3. Click reset link (valid for 1 hour)

**Step 3: Reset Password**
1. Enter new password
2. Confirm new password
3. Click "Reset Password"
4. Receive confirmation

**Step 4: Login with New Password**
1. Go to login page
2. Enter email and new password
3. Click "Sign In"

#### Account Locked Recovery

**Reason:** Multiple failed login attempts

**Recovery Steps:**
1. Wait 15 minutes
2. Try logging in again
3. If still locked, use password recovery
4. Contact admin if issue persists

#### Email Verification Recovery

**If Email Not Verified:**
1. Check spam/junk folder
2. Request new verification email
3. Click verification link
4. Account activated

#### Account Deletion Recovery

**If Account Deleted:**
1. Contact admin support
2. Provide identification
3. Admin can restore account
4. Recovery within 30 days

---

### 3. Creating an Account Process

#### Step 1: Access Registration Page
1. Navigate to `https://your-domain.com`
2. Click "Create Account" or "Sign Up"
3. Registration form appears

#### Step 2: Fill Registration Form

**Required Fields:**
- **Full Name**
  - Enter your complete name
  - Minimum 2 characters
  - Maximum 100 characters

- **Email Address**
  - Enter valid email
  - Must be unique
  - Used for login and notifications

- **Phone Number**
  - Enter valid phone number
  - Format: +63 9XX XXX XXXX
  - Used for SMS notifications

- **Password**
  - Minimum 8 characters
  - Must include uppercase letter
  - Must include lowercase letter
  - Must include number
  - Must include special character (!@#$%^&*)

- **Confirm Password**
  - Re-enter password
  - Must match password field

#### Step 3: Accept Terms
1. Read Terms and Conditions
2. Read Privacy Policy
3. Check "I agree to Terms and Conditions"
4. Check "I agree to Privacy Policy"

#### Step 4: Submit Registration
1. Click "Create Account" button
2. Wait for processing
3. Receive confirmation message

#### Step 5: Email Verification
1. Check email inbox
2. Open verification email
3. Click verification link
4. Account activated

#### Step 6: Complete Profile (Optional)
1. Login to account
2. Go to Profile Settings
3. Add additional information:
   - Profile picture
   - Address
   - Date of birth
   - Preferences
4. Save changes

#### Account Creation Troubleshooting
- **Email Already Exists:** Use different email or password recovery
- **Password Too Weak:** Follow password requirements
- **Verification Email Not Received:** Check spam folder or request new email
- **Form Validation Errors:** Ensure all fields are filled correctly

---

## System Modules Guide

### Module 1: Authentication & User Management

**Purpose:** Manage user accounts and access control

**Key Features:**
- User registration and login
- Password management
- Session management
- Multi-role authentication
- Permission assignment

**Screenshots to Capture:**
- [ ] Login page (desktop)
- [ ] Login page (mobile)
- [ ] Registration page
- [ ] Password recovery page
- [ ] User dashboard after login
- [ ] Profile settings page
- [ ] Permission management (admin)
- [ ] User list (admin)

**Access Points:**
- Admin: `/admin/users`
- Staff: `/staff/users` (if applicable)
- Client: `/profile`

---

### Module 2: Dashboard & Analytics

**Purpose:** Provide system overview and key metrics

**Key Features:**
- System statistics
- Activity overview
- Recent transactions
- User activity
- Performance metrics

**Screenshots to Capture:**
- [ ] Admin dashboard (desktop)
- [ ] Admin dashboard (tablet)
- [ ] Admin dashboard (mobile)
- [ ] Dashboard widgets
- [ ] Analytics charts
- [ ] Activity logs
- [ ] System health status

**Access Points:**
- Admin: `/admin/dashboard`
- Staff: `/staff/dashboard`
- Client: `/client/dashboard`

---

### Module 3: Property Management

**Purpose:** Manage cemetery properties and lots

**Key Features:**
- Property listing
- Property creation/editing
- Property types (Lawn Lot, Columbarium, etc.)
- Availability tracking
- Property details

**Screenshots to Capture:**
- [ ] Property list view (admin)
- [ ] Property grid view
- [ ] Property detail page
- [ ] Create property form
- [ ] Edit property form
- [ ] Property availability status
- [ ] Property type selection
- [ ] Property search/filter

**Access Points:**
- Admin: `/admin/properties`
- Staff: `/staff/properties`
- Client: `/properties`

---

### Module 4: Service Management

**Purpose:** Manage cemetery services and offerings

**Key Features:**
- Service listing
- Service creation/editing
- Service pricing
- Service requirements
- Service availability
- Service images

**Screenshots to Capture:**
- [ ] Service list (admin)
- [ ] Service detail page
- [ ] Create service form
- [ ] Edit service form
- [ ] Service pricing table
- [ ] Service requirements
- [ ] Service image upload
- [ ] Service availability calendar

**Access Points:**
- Admin: `/admin/services`
- Staff: `/staff/services`
- Client: `/services`

---

### Module 5: Booking & Reservation

**Purpose:** Manage service bookings and reservations

**Key Features:**
- Booking creation
- Booking status tracking
- Booking history
- Booking authorization
- Booking cancellation
- Booking confirmation

**Screenshots to Capture:**
- [ ] Booking list (admin)
- [ ] Booking detail page
- [ ] Create booking form
- [ ] Booking calendar
- [ ] Booking status updates
- [ ] Booking confirmation email
- [ ] Booking history
- [ ] Booking authorization form

**Access Points:**
- Admin: `/admin/bookings`
- Staff: `/staff/bookings`
- Client: `/bookings`

---

### Module 6: Payment & Billing

**Purpose:** Process payments and manage billing

**Key Features:**
- Payment processing
- Invoice generation
- Payment history
- Payment plans
- Transaction tracking
- Receipt generation

**Screenshots to Capture:**
- [ ] Payment page
- [ ] Payment form
- [ ] Payment confirmation
- [ ] Invoice list
- [ ] Invoice detail
- [ ] Payment history
- [ ] Receipt
- [ ] Payment plan options
- [ ] Billing dashboard (admin)

**Access Points:**
- Admin: `/admin/payments`
- Staff: `/staff/payments`
- Client: `/payments`

---

### Module 7: Client Management

**Purpose:** Manage client information and relationships

**Key Features:**
- Client profile
- Client status tracking
- Client history
- Client communication
- Client preferences
- Client documents

**Screenshots to Capture:**
- [ ] Client list (admin)
- [ ] Client detail page
- [ ] Client profile (client view)
- [ ] Edit client profile
- [ ] Client status
- [ ] Client activity history
- [ ] Client communication log
- [ ] Client preferences

**Access Points:**
- Admin: `/admin/clients`
- Staff: `/staff/clients`
- Client: `/profile`

---

### Module 8: Notification System

**Purpose:** Send and manage notifications

**Key Features:**
- Email notifications
- SMS notifications
- In-app notifications
- Notification history
- Notification preferences
- Notification templates

**Screenshots to Capture:**
- [ ] Notification center
- [ ] Email notification template
- [ ] SMS notification template
- [ ] Notification preferences
- [ ] Notification history
- [ ] Send notification form (admin)
- [ ] Notification bell icon
- [ ] Notification dropdown

**Access Points:**
- Admin: `/admin/notifications`
- Staff: `/staff/notifications`
- Client: `/notifications`

---

### Module 9: Inquiry & Contact

**Purpose:** Handle customer inquiries and messages

**Key Features:**
- Contact form
- Inquiry submission
- Inquiry tracking
- Response management
- Inquiry history
- Contact information

**Screenshots to Capture:**
- [ ] Contact form (public)
- [ ] Contact form (mobile)
- [ ] Inquiry list (admin)
- [ ] Inquiry detail page
- [ ] Inquiry status
- [ ] Response form
- [ ] Inquiry history
- [ ] Contact information page

**Access Points:**
- Public: `/contact`
- Admin: `/admin/inquiries`
- Staff: `/staff/inquiries`

---

### Module 10: Maintenance Request

**Purpose:** Handle maintenance requests and issues

**Key Features:**
- Request creation
- Request status tracking
- Request assignment
- Request history
- Request priority
- Request resolution

**Screenshots to Capture:**
- [ ] Maintenance request form
- [ ] Request list (admin)
- [ ] Request detail page
- [ ] Request status updates
- [ ] Assign request form
- [ ] Request history
- [ ] Request priority levels
- [ ] Request resolution

**Access Points:**
- Admin: `/admin/maintenance`
- Staff: `/staff/maintenance`
- Client: `/maintenance-requests`

---

## Screenshot Checklist

### Admin Side Screenshots

#### Authentication
- [ ] Admin login page
- [ ] Admin dashboard
- [ ] User management list
- [ ] Create user form
- [ ] Edit user form
- [ ] Permission management
- [ ] Role assignment

#### Property Management
- [ ] Property list
- [ ] Property detail
- [ ] Create property
- [ ] Edit property
- [ ] Property availability

#### Service Management
- [ ] Service list
- [ ] Service detail
- [ ] Create service
- [ ] Edit service
- [ ] Service pricing

#### Booking Management
- [ ] Booking list
- [ ] Booking detail
- [ ] Booking status updates
- [ ] Booking authorization

#### Payment Management
- [ ] Payment list
- [ ] Invoice list
- [ ] Payment detail
- [ ] Generate invoice

#### Client Management
- [ ] Client list
- [ ] Client detail
- [ ] Client status
- [ ] Client activity

#### Notifications
- [ ] Notification center
- [ ] Send notification
- [ ] Notification history
- [ ] Email templates

#### System Settings
- [ ] Settings page
- [ ] Email configuration
- [ ] SMS configuration
- [ ] Payment gateway settings

#### Reports
- [ ] Revenue report
- [ ] Booking report
- [ ] Client report
- [ ] Activity log

---

### Client Side Screenshots

#### Authentication
- [ ] Client login page
- [ ] Client registration page
- [ ] Password recovery page
- [ ] Email verification

#### Dashboard
- [ ] Client dashboard
- [ ] Dashboard widgets
- [ ] Recent bookings
- [ ] Upcoming services

#### Services
- [ ] Service listing
- [ ] Service detail
- [ ] Service search
- [ ] Service filter

#### Booking
- [ ] Create booking
- [ ] Booking confirmation
- [ ] Booking history
- [ ] Booking status

#### Payment
- [ ] Payment page
- [ ] Payment confirmation
- [ ] Invoice view
- [ ] Payment history

#### Profile
- [ ] Profile page
- [ ] Edit profile
- [ ] Change password
- [ ] Preferences

#### Notifications
- [ ] Notification center
- [ ] Notification preferences
- [ ] Notification history

#### Contact
- [ ] Contact form
- [ ] Inquiry submission
- [ ] Inquiry status

---

### Mobile Screenshots (All Modules)

#### Responsive Design
- [ ] Mobile login
- [ ] Mobile dashboard
- [ ] Mobile navigation
- [ ] Mobile menu
- [ ] Mobile forms
- [ ] Mobile tables
- [ ] Mobile cards
- [ ] Mobile buttons

#### Specific Pages
- [ ] Mobile service listing
- [ ] Mobile booking form
- [ ] Mobile payment page
- [ ] Mobile profile
- [ ] Mobile notifications

---

## Additional Documentation

### API Documentation
- Endpoint specifications
- Request/response formats
- Authentication methods
- Error handling
- Rate limiting

### Database Schema
- Table structures
- Relationships
- Indexes
- Constraints

### Security Guidelines
- Password policies
- Data encryption
- Access control
- Audit logging
- Backup procedures

### Performance Optimization
- Caching strategies
- Database optimization
- Frontend optimization
- API optimization

### Troubleshooting Guide
- Common issues
- Error messages
- Resolution steps
- Support contacts

---

## Support & Contact

### Technical Support
- **Email:** support@sanctuario.com
- **Phone:** +63 (0) XXX XXX XXXX
- **Hours:** Monday - Friday, 9:00 AM - 5:00 PM

### Emergency Support
- **Phone:** +63 (0) XXX XXX XXXX (24/7)
- **Email:** emergency@sanctuario.com

### Documentation
- **Wiki:** https://docs.sanctuario.com
- **FAQ:** https://faq.sanctuario.com
- **Blog:** https://blog.sanctuario.com

---

**Document Version:** 1.0  
**Last Updated:** May 3, 2026  
**Status:** Complete
