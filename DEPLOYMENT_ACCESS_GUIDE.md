# Sanctuario System - Deployment Access Guide
# Paano I-Access ang System Pagkatapos ng Deployment

---

## 🌐 AFTER DEPLOYMENT

Once the system is deployed to a live server, here's how users can access it:

---

## 📱 CLIENT ACCESS (Regular Users)

### **Main Website URL**
```
https://www.sanctuario.com
or
https://sanctuario.com
```

### **How to Access:**

#### **1. Public Access (No Login)**
1. Open browser
2. Go to: `https://www.sanctuario.com`
3. Browse services and properties
4. View contact information
5. No login required

#### **2. Create New Account**
1. Go to: `https://www.sanctuario.com`
2. Click **"Sign Up"** button
3. Fill in registration form:
   - Full Name
   - Email Address
   - Phone Number
   - Password
4. Click **"Create Account"**
5. Verify email (check inbox)
6. Login with credentials

#### **3. Login to Account**
1. Go to: `https://www.sanctuario.com`
2. Click **"Login"** button
3. Enter email and password
4. Click **"Sign In"**
5. Access your dashboard

### **Client Features Available:**
- ✅ Browse services and properties
- ✅ Make reservations
- ✅ View payment history
- ✅ Manage profile
- ✅ View notifications
- ✅ Submit maintenance requests
- ✅ Download receipts

---

## 👨‍💼 ADMIN ACCESS

### **Admin Portal URL**
```
https://www.sanctuario.com/admin
or
https://admin.sanctuario.com
```

### **How to Access:**

1. Go to admin portal URL
2. Enter admin credentials:
   - Email: `admin@sanctuario.com`
   - Password: (provided by administrator)
3. Click **"Sign In"**
4. Access admin dashboard

### **Admin Features Available:**
- ✅ Dashboard (overview & statistics)
- ✅ Customer Management
- ✅ Billing & Payments
- ✅ Property Management
- ✅ Service Management
- ✅ Reservation Management
- ✅ SMS Notifications
- ✅ Activity Logs
- ✅ Site Settings
- ✅ User Management

---

## 📍 DEPLOYMENT URLS

### **Production URLs**

| Component | URL | Purpose |
|-----------|-----|---------|
| **Main Website** | `https://www.sanctuario.com` | Client access |
| **Admin Portal** | `https://www.sanctuario.com/admin` | Admin access |
| **API Backend** | `https://api.sanctuario.com` | API calls |
| **Contact Page** | `https://www.sanctuario.com/contact` | Contact form |
| **Services** | `https://www.sanctuario.com/services` | Service listing |
| **About** | `https://www.sanctuario.com/about` | About page |

---

## 🔐 SECURITY FEATURES

### **For Clients:**
- ✅ Secure login with password encryption
- ✅ Email verification for new accounts
- ✅ Password recovery option
- ✅ Session timeout for security
- ✅ HTTPS encryption for all data

### **For Admin:**
- ✅ Admin-only login portal
- ✅ Role-based access control
- ✅ Activity logging
- ✅ Permission management
- ✅ Secure API endpoints

---

## 📱 MOBILE ACCESS

### **Mobile Website**
- Fully responsive design
- Works on all devices
- Same URL as desktop: `https://www.sanctuario.com`

### **Mobile Features:**
- ✅ Browse services
- ✅ Make reservations
- ✅ View payments
- ✅ Manage profile
- ✅ View notifications

---

## 🔑 CREDENTIALS

### **Admin Account**
```
Email: admin@sanctuario.com
Password: (provided by administrator)
```

### **Test Accounts** (if provided)
```
Email: test@sanctuario.com
Password: (provided by administrator)
```

---

## 🌍 DOMAIN SETUP

### **Domain Configuration**

**Option 1: Single Domain**
```
https://www.sanctuario.com          → Client website
https://www.sanctuario.com/admin    → Admin portal
```

**Option 2: Separate Domains**
```
https://www.sanctuario.com          → Client website
https://admin.sanctuario.com        → Admin portal
https://api.sanctuario.com          → API backend
```

**Option 3: Subdomain**
```
https://sanctuario.com              → Client website
https://admin.sanctuario.com        → Admin portal
https://api.sanctuario.com          → API backend
```

---

## 🚀 DEPLOYMENT PLATFORMS

### **Recommended Platforms:**

#### **1. Railway**
- Easy deployment
- Automatic SSL
- Database hosting
- URL: `https://your-app.railway.app`

#### **2. Render**
- Free tier available
- Automatic deployments
- Built-in database
- URL: `https://your-app.onrender.com`

#### **3. AWS**
- Scalable
- Professional hosting
- Custom domain
- URL: `https://your-custom-domain.com`

#### **4. DigitalOcean**
- Affordable
- Full control
- Custom domain
- URL: `https://your-custom-domain.com`

---

## 📞 USER SUPPORT

### **For Clients:**
- Email: `support@sanctuario.com`
- Phone: `+63 (0) XXX XXX XXXX`
- Hours: Monday - Friday, 9:00 AM - 5:00 PM

### **For Admin:**
- Email: `admin-support@sanctuario.com`
- Phone: `+63 (0) XXX XXX XXXX`
- Hours: 24/7 (Emergency)

---

## ✅ DEPLOYMENT CHECKLIST

Before going live, ensure:

- [ ] Domain name registered
- [ ] SSL certificate installed
- [ ] Database configured
- [ ] Email service configured
- [ ] SMS service configured
- [ ] Payment gateway configured
- [ ] Admin account created
- [ ] Site settings configured
- [ ] Logo and branding updated
- [ ] Contact information updated
- [ ] Terms & Conditions updated
- [ ] Privacy Policy updated
- [ ] Backup system configured
- [ ] Monitoring system configured
- [ ] Support email configured

---

## 🔄 ACCESSING AFTER DEPLOYMENT

### **Step 1: Get Domain Name**
- Register domain (e.g., sanctuario.com)
- Point domain to server

### **Step 2: Access Website**
- Open browser
- Type: `https://www.sanctuario.com`
- Website loads

### **Step 3: Client Login**
- Click "Login"
- Enter credentials
- Access dashboard

### **Step 4: Admin Login**
- Go to: `https://www.sanctuario.com/admin`
- Enter admin credentials
- Access admin panel

---

## 🆘 TROUBLESHOOTING

### **"Website not found"**
- ✅ Check domain is registered
- ✅ Check DNS settings
- ✅ Wait 24-48 hours for DNS propagation
- ✅ Check server is running

### **"Cannot login"**
- ✅ Check credentials
- ✅ Check email verification
- ✅ Try password recovery
- ✅ Contact support

### **"Page loading slowly"**
- ✅ Check server performance
- ✅ Check database performance
- ✅ Check internet connection
- ✅ Clear browser cache

### **"SSL certificate error"**
- ✅ Check SSL certificate is installed
- ✅ Check certificate is valid
- ✅ Wait for certificate to propagate
- ✅ Contact hosting provider

---

## 📊 MONITORING

### **After Deployment, Monitor:**
- ✅ Website uptime
- ✅ Page load times
- ✅ Error logs
- ✅ User activity
- ✅ Database performance
- ✅ Server resources

---

**Last Updated:** May 3, 2026
**Status:** Ready for Deployment
