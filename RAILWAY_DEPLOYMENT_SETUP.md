# Railway Deployment Setup for Sanctuario Project

## ✅ Setup Complete!

Your Sanctuario project is now configured for Railway deployment. Here's everything you need to know.

---

## 🚀 Quick Start (5 Steps)

### **Step 1: Create Railway Account**
1. Go to https://railway.app
2. Click **"Start Free"**
3. Sign up with GitHub (recommended)
4. Authorize Railway to access your GitHub

### **Step 2: Create New Project**
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search for: **`Bossing15/Sanctuario_Project`**
4. Click **"Deploy"**

### **Step 3: Add MySQL Database**
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"MySQL"**
3. Railway will create the database automatically
4. Note the connection details

### **Step 4: Configure Environment Variables**
1. Go to your backend service settings
2. Click **"Variables"**
3. Add all variables (see section below)
4. Save changes

### **Step 5: Deploy**
1. Railway auto-deploys when you push to GitHub
2. Or manually trigger deployment
3. Wait 5-10 minutes for build
4. Check logs for any errors

---

## 📋 Environment Variables

### **Backend Service Variables**

Copy and paste these into Railway's environment variables:

```
APP_NAME=Sanctuario
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:8sJZ19eM4swYKmfeXRSDywYWbOfH0koJ09fbz3vqo30=
APP_URL=https://your-backend-url.railway.app
APP_CLIENT_URL=https://your-frontend-url.railway.app

DB_CONNECTION=mysql
DB_HOST=${{ Mysql.MYSQL_HOST }}
DB_PORT=${{ Mysql.MYSQL_PORT }}
DB_DATABASE=${{ Mysql.MYSQL_DATABASE }}
DB_USERNAME=${{ Mysql.MYSQL_USER }}
DB_PASSWORD=${{ Mysql.MYSQL_PASSWORD }}

LOG_CHANNEL=stack
LOG_LEVEL=debug

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=log
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="Sanctuario"

FRONTEND_URL=https://your-frontend-url.railway.app

PAYMONGO_ENVIRONMENT=test
PAYMONGO_TEST_PUBLIC_KEY=pk_test_YOUR_TEST_PUBLIC_KEY
PAYMONGO_TEST_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY

SMS_API_KEY=YOUR_SMS_API_KEY
SMS_PROVIDER=semaphore
SMS_FROM_NAME=Sanctuario

RESEND_API_KEY=YOUR_RESEND_API_KEY
```

### **Frontend Service Variables**

```
NODE_ENV=production
PORT=3002
REACT_APP_API_URL=https://your-backend-url.railway.app
```

---

## 🏗️ Project Structure for Railway

```
Sanctuario_Project/
├── package.json (Backend)
├── Procfile (Process file)
├── railway.toml (Railway config)
├── .env (Environment variables)
├── resources/
│   └── js/src/ (Admin dashboard)
├── client-app/
│   ├── package.json (Frontend)
│   ├── src/
│   └── public/
└── app/
    ├── Http/
    ├── Models/
    └── Console/
```

---

## 📝 Configuration Files Included

### **1. railway.toml**
- Specifies build and deployment settings
- Uses nixpacks for automatic dependency detection
- Configures restart policy

### **2. Procfile**
- Tells Railway how to start the application
- Command: `npm start` (runs Laravel server)

### **3. package.json**
- Already configured with correct scripts
- `npm start` → `php artisan serve`
- `npm run build` → `vite build`

---

## 🔧 How Railway Detects Your Project

Railway automatically detects:

```
✅ Node.js (from package.json)
✅ PHP/Laravel (from composer.json)
✅ React (from client-app/package.json)
✅ MySQL (from database service)
```

---

## 🚀 Deployment Process

### **Step-by-Step**

```
1. You push code to GitHub
   ↓
2. Railway detects changes
   ↓
3. Railway builds your project
   ├─ Installs dependencies
   ├─ Builds frontend
   ├─ Compiles backend
   └─ Prepares for deployment
   ↓
4. Railway deploys
   ├─ Starts backend service
   ├─ Starts frontend service
   └─ Connects to database
   ↓
5. Your app is LIVE! 🎉
```

### **Build Time**
- First build: 10-15 minutes
- Subsequent builds: 5-10 minutes

---

## 📊 Railway Dashboard Overview

### **What You'll See**

```
Project: Sanctuario
├── Services
│   ├── Backend (Node.js)
│   │   ├─ Status: Running ✅
│   │   ├─ URL: https://...railway.app
│   │   ├─ Logs
│   │   └─ Variables
│   │
│   ├── Frontend (Node.js)
│   │   ├─ Status: Running ✅
│   │   ├─ URL: https://...railway.app
│   │   ├─ Logs
│   │   └─ Variables
│   │
│   └── MySQL Database
│       ├─ Status: Running ✅
│       ├─ Host: ...railway.app
│       ├─ Port: 3306
│       └─ Credentials
│
└── Deployments
    ├─ Latest: Success ✅
    ├─ Previous: Success ✅
    └─ History
```

---

## 🔍 Monitoring Your Deployment

### **Check Logs**
1. Go to service → **"Logs"** tab
2. View real-time logs
3. Check for errors

### **Check Status**
1. Look at service status indicator
2. Green = Running ✅
3. Red = Error ❌

### **Check Metrics**
1. Go to service → **"Metrics"** tab
2. View CPU, memory, network usage
3. Monitor costs

---

## 🧪 Testing Your Deployment

### **Test Backend API**
```bash
curl https://your-backend-url.railway.app/api/health
```

### **Test Frontend**
```
Visit: https://your-frontend-url.railway.app
```

### **Test Database Connection**
1. Go to backend logs
2. Look for "Connected to database" message
3. Or check for connection errors

### **Test Login**
1. Visit frontend URL
2. Go to login page
3. Try logging in
4. Check if API calls work

---

## 🐛 Troubleshooting

### **Build Failed**

**Solution:**
1. Check build logs in Railway dashboard
2. Look for error messages
3. Common issues:
   - Missing dependencies
   - Syntax errors
   - Environment variables not set

**Fix:**
1. Fix the error in your code
2. Push to GitHub
3. Railway auto-redeploys

### **Database Connection Error**

**Solution:**
1. Check environment variables
2. Verify DB credentials are correct
3. Check if database service is running

**Fix:**
1. Go to Variables tab
2. Verify all DB_* variables
3. Use Railway's MySQL variables (see above)

### **Frontend Can't Connect to Backend**

**Solution:**
1. Check REACT_APP_API_URL
2. Verify backend is running
3. Check browser console for errors

**Fix:**
1. Update REACT_APP_API_URL to correct backend URL
2. Redeploy frontend
3. Clear browser cache

### **Service Won't Start**

**Solution:**
1. Check logs for error messages
2. Verify all environment variables are set
3. Check if dependencies are installed

**Fix:**
1. Review error in logs
2. Fix the issue
3. Push to GitHub
4. Railway auto-redeploys

---

## 💰 Cost Monitoring

### **Check Your Costs**

1. Go to Railway dashboard
2. Click **"Billing"** or **"Usage"**
3. View current month's costs
4. See breakdown by service

### **Estimated Costs**

```
Small Project:
├─ Backend: $3/month
├─ Frontend: $1.50/month
├─ Database: $3/month
├─ Total: $7.50/month
├─ Credit: -$5/month
└─ You Pay: $2.50/month ✅
```

### **Ways to Reduce Costs**

1. **Optimize code** - Less CPU usage
2. **Use caching** - Reduce database queries
3. **Compress assets** - Smaller file sizes
4. **Monitor resources** - Adjust as needed

---

## 🔐 Security Best Practices

### **Environment Variables**
- ✅ Never commit secrets to GitHub
- ✅ Use Railway's Variables tab
- ✅ Rotate API keys regularly
- ✅ Use strong database passwords

### **Database**
- ✅ Use strong passwords
- ✅ Enable SSL connections
- ✅ Regular backups
- ✅ Limit access

### **API Keys**
- ✅ Keep PayMongo keys secret
- ✅ Keep SMS API keys secret
- ✅ Keep Resend API keys secret
- ✅ Rotate regularly

---

## 📈 Scaling Your Application

### **When to Scale**

```
If you experience:
├─ Slow response times
├─ High CPU usage
├─ Database connection errors
└─ High traffic

Then it's time to scale!
```

### **How to Scale**

1. **Increase resources**
   - Go to service settings
   - Increase CPU/RAM
   - Redeploy

2. **Add more replicas**
   - Go to service settings
   - Increase number of replicas
   - Railway handles load balancing

3. **Upgrade database**
   - Go to database settings
   - Increase resources
   - Redeploy

---

## 🔄 Continuous Deployment

### **Auto-Deploy on GitHub Push**

Railway automatically deploys when you push to GitHub:

```
1. You push code to GitHub
   ↓
2. Railway detects changes
   ↓
3. Railway builds and deploys
   ↓
4. Your app updates automatically! 🎉
```

### **Manual Deployment**

If you need to manually deploy:

1. Go to service → **"Deployments"**
2. Click **"Deploy"** button
3. Select branch to deploy
4. Click **"Deploy"**

---

## 📚 Useful Commands

### **View Logs**
```
Railway Dashboard → Service → Logs
```

### **SSH into Service**
```
Railway Dashboard → Service → Shell
```

### **Restart Service**
```
Railway Dashboard → Service → Restart
```

### **View Environment Variables**
```
Railway Dashboard → Service → Variables
```

---

## 🎯 Next Steps

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select your GitHub repo

3. **Add MySQL Database**
   - Click "+ New"
   - Select "MySQL"

4. **Configure Variables**
   - Add all environment variables
   - Use Railway's MySQL variables

5. **Deploy**
   - Railway auto-deploys
   - Wait 5-10 minutes
   - Check logs

6. **Test**
   - Visit your URLs
   - Test login
   - Check API calls

7. **Monitor**
   - Check logs regularly
   - Monitor costs
   - Monitor performance

---

## 📞 Support

### **Railway Support**
- Docs: https://docs.railway.app
- Support: https://railway.app/support
- Discord: https://discord.gg/railway

### **Sanctuario Support**
- GitHub: https://github.com/Bossing15/Sanctuario_Project
- Issues: https://github.com/Bossing15/Sanctuario_Project/issues

---

## ✅ Deployment Checklist

- [ ] Create Railway account
- [ ] Create new project
- [ ] Add MySQL database
- [ ] Configure backend variables
- [ ] Configure frontend variables
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Run database migrations
- [ ] Test backend API
- [ ] Test frontend
- [ ] Test login
- [ ] Monitor logs
- [ ] Check costs

---

## 🎉 You're Ready!

Your Sanctuario project is now configured for Railway deployment!

**Next Step:** Create a Railway account and deploy! 🚀

---

**Repository**: https://github.com/Bossing15/Sanctuario_Project.git
**Configuration Files**: railway.toml, Procfile, package.json
**Date**: April 29, 2026
**Status**: Ready for Railway Deployment ✅
