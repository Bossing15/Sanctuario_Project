# Railway Deployment - Quick Guide (10 Minutes)

## 🚀 Deploy in 10 Minutes

### **Step 1: Create Railway Account (2 min)**

1. Go to https://railway.app
2. Click **"Start Free"**
3. Click **"Sign up with GitHub"**
4. Authorize Railway
5. ✅ Account created!

---

### **Step 2: Create New Project (1 min)**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Search: `Bossing15/Sanctuario_Project`
4. Click **"Deploy"**
5. ✅ Project created!

---

### **Step 3: Add MySQL Database (2 min)**

1. In your project, click **"+ New"**
2. Select **"Database"** → **"MySQL"**
3. Railway creates it automatically
4. ✅ Database ready!

---

### **Step 4: Set Environment Variables (3 min)**

**For Backend Service:**

1. Click on backend service
2. Go to **"Variables"** tab
3. Add these variables:

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
BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

MAIL_MAILER=log
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

4. Click **"Save"**
5. ✅ Variables set!

**For Frontend Service:**

1. Click on frontend service
2. Go to **"Variables"** tab
3. Add these variables:

```
NODE_ENV=production
PORT=3002
REACT_APP_API_URL=https://your-backend-url.railway.app
```

4. Click **"Save"**
5. ✅ Frontend variables set!

---

### **Step 5: Deploy (2 min)**

1. Railway auto-deploys when you push to GitHub
2. Or manually trigger:
   - Go to service → **"Deployments"**
   - Click **"Deploy"**
3. Wait 5-10 minutes for build
4. ✅ Deployed!

---

## ✅ Done!

Your Sanctuario project is now live on Railway! 🎉

```
Backend:  https://your-backend-url.railway.app
Frontend: https://your-frontend-url.railway.app
```

---

## 🧪 Test Your Deployment

### **Test Backend**
```bash
curl https://your-backend-url.railway.app/api/health
```

### **Test Frontend**
Visit: `https://your-frontend-url.railway.app`

### **Test Login**
1. Go to frontend URL
2. Click login
3. Try logging in
4. ✅ Should work!

---

## 📊 Monitor Your App

1. Go to Railway dashboard
2. Click on your project
3. View logs, metrics, and status
4. Check costs

---

## 💰 Cost

```
Small project: $2.50/month (with $5 credit)
Medium project: $8/month (with $5 credit)
Large project: $20/month (with $5 credit)
```

---

## 🆘 Issues?

### **Build Failed?**
- Check logs in Railway dashboard
- Fix errors in code
- Push to GitHub
- Railway auto-redeploys

### **Can't Connect to Database?**
- Check environment variables
- Verify DB credentials
- Check if database is running

### **Frontend Can't Reach Backend?**
- Check REACT_APP_API_URL
- Verify backend is running
- Check browser console

---

## 📚 Full Guide

For detailed information, see: `RAILWAY_DEPLOYMENT_SETUP.md`

---

**Repository**: https://github.com/Bossing15/Sanctuario_Project.git
**Status**: Ready for Railway Deployment ✅
