# Paano I-Access ang Sanctuario System
# How to Access the Sanctuario System

---

## 🚀 QUICK START

### **Step 1: Start the Backend Server**
```bash
cd Sanctuario_Project
php artisan serve
```
✅ Backend runs on: `http://localhost:8000`

### **Step 2: Start the Frontend Server**
```bash
cd Sanctuario_Project/client-app
npm start
```
✅ Frontend runs on: `http://localhost:3000`

### **Step 3: Open in Browser**
- **Client Side:** `http://localhost:3000`
- **Admin Side:** `http://localhost:8000` (or login through client)

---

## 📱 ACCESSING AS CLIENT (Regular User)

### **Option 1: Public Access (No Login)**
1. Go to: `http://localhost:3000`
2. Browse services and properties
3. View contact information
4. No login required

### **Option 2: Create Account**
1. Go to: `http://localhost:3000`
2. Click **"Sign Up"** button
3. Fill in:
   - Full Name
   - Email
   - Phone Number
   - Password
4. Click **"Create Account"**
5. Verify email (check inbox)
6. Login with email and password

### **Option 3: Login with Existing Account**
1. Go to: `http://localhost:3000`
2. Click **"Login"** button
3. Enter email and password
4. Click **"Sign In"**
5. Access client dashboard

### **Client Dashboard Features:**
- View services and properties
- Make reservations
- View payment history
- Manage profile
- View notifications
- Submit maintenance requests

---

## 👨‍💼 ACCESSING AS ADMIN

### **Admin Login**
1. Go to: `http://localhost:8000/login`
2. Enter admin credentials:
   - Email: `admin@sanctuario.com`
   - Password: (check `.env` or ask admin)
3. Click **"Sign In"**
4. Access admin dashboard

### **Admin Dashboard Features:**
- Dashboard (overview & stats)
- Customers (client management)
- Billing (payments & invoices)
- Graves (properties management)
- Requirements (service requirements)
- Products (property catalog)
- Services (service management)
- Messages (contact inquiries)
- SMS (SMS notifications)
- Activity Logs (system logs)
- Admin (user management)
- Settings (site configuration)

---

## 🔑 DEFAULT CREDENTIALS

### **Admin Account**
```
Email: admin@sanctuario.com
Password: (check .env file or ask administrator)
```

### **Test Client Account**
```
Email: client@sanctuario.com
Password: (check .env file or ask administrator)
```

---

## 📍 MAIN URLS

| Page | URL | Access |
|------|-----|--------|
| Home | `http://localhost:3000/` | Public |
| Services | `http://localhost:3000/services` | Public |
| Lawn Lots | `http://localhost:3000/lawn-lots` | Public |
| Contact | `http://localhost:3000/contact` | Public |
| Login | `http://localhost:3000/login` | Public |
| Sign Up | `http://localhost:3000/signup` | Public |
| Client Dashboard | `http://localhost:3000/dashboard` | Login Required |
| Admin Login | `http://localhost:8000/login` | Public |
| Admin Dashboard | `http://localhost:8000/admin/dashboard` | Admin Only |

---

## ⚙️ SYSTEM REQUIREMENTS

### **To Run Locally:**
- PHP 8.0+
- MySQL 5.7+
- Node.js 14+
- npm 6+

### **To Access:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Both backend and frontend servers running

---

## 🔧 TROUBLESHOOTING

### **"Cannot connect to server"**
- ✅ Check if backend is running: `php artisan serve`
- ✅ Check if frontend is running: `npm start`
- ✅ Check ports: Backend (8000), Frontend (3000)

### **"Check your connection" on signup**
- ✅ Make sure backend server is running
- ✅ Check database connection in `.env`
- ✅ Check browser console for errors (F12)

### **"Page not found"**
- ✅ Make sure you're on correct URL
- ✅ Check if you're logged in (if required)
- ✅ Refresh the page

### **"Cannot access admin panel"**
- ✅ Make sure you're logged in as admin
- ✅ Check your user role/permissions
- ✅ Try logging out and logging back in

---

## 📞 SUPPORT

If you encounter issues:
1. Check the browser console (F12)
2. Check server logs
3. Verify `.env` configuration
4. Restart both servers
5. Clear browser cache

---

**Last Updated:** May 3, 2026
