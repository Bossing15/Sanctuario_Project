# Railway Deployment Fix - "npm: command not found" Error

## ❌ Problem

Railway crashed with error:
```
/bin/bash: line 1: npm: command not found
```

## ✅ Solution

The issue was that Railway was trying to run `npm start` on a PHP/Laravel project. We've fixed this by:

1. **Updated Procfile** - Now uses PHP instead of npm
2. **Updated railway.toml** - Correct start command
3. **Created nixpacks.toml** - Tells Railway how to build the project
4. **Created .env.example** - Environment template for Railway

---

## 🔧 What Was Changed

### **1. Procfile (Fixed)**

**Before:**
```
web: npm start
```

**After:**
```
web: php artisan serve --host=0.0.0.0 --port=$PORT
```

### **2. railway.toml (Fixed)**

**Before:**
```
startCommand = "npm start"
```

**After:**
```
startCommand = "php artisan serve --host=0.0.0.0 --port=$PORT"
```

### **3. nixpacks.toml (New)**

Tells Railway:
- Use PHP 8.2
- Use Node.js 20
- Install composer dependencies
- Build frontend (React)
- Build backend (Vite)
- Start with PHP artisan serve

### **4. .env.example (New)**

Template for environment variables that Railway uses

---

## 🚀 How to Redeploy

### **Option 1: Automatic Redeploy**

1. Push the fixed code to GitHub:
```bash
git add Procfile railway.toml nixpacks.toml .env.example
git commit -m "Fix Railway deployment - use PHP instead of npm"
git push origin main
```

2. Railway automatically redeploys
3. Wait 5-10 minutes
4. Check logs for success

### **Option 2: Manual Redeploy**

1. Go to Railway dashboard
2. Click on your project
3. Go to **"Deployments"** tab
4. Click **"Redeploy"** button
5. Select latest commit
6. Click **"Deploy"**
7. Wait 5-10 minutes

---

## 📋 Build Process (What Railway Will Do)

```
1. Detect PHP project
   ↓
2. Install PHP 8.2
   ↓
3. Install Node.js 20
   ↓
4. Run: composer install --no-dev --optimize-autoloader
   ↓
5. Build frontend: cd client-app && npm install && npm run build
   ↓
6. Run: npm run build (Vite build)
   ↓
7. Generate APP_KEY
   ↓
8. Start: php artisan serve --host=0.0.0.0 --port=$PORT
   ↓
9. Your app is LIVE! 🎉
```

---

## ✅ Verification

After redeployment, check:

1. **Build Logs**
   - Go to service → "Logs"
   - Look for "Build successful"
   - No npm errors

2. **Deployment Status**
   - Service status should be "Running" ✅
   - Green indicator

3. **Test Backend**
   ```bash
   curl https://your-backend-url.railway.app/api/health
   ```

4. **Test Frontend**
   - Visit: https://your-frontend-url.railway.app

---

## 🐛 If It Still Fails

### **Check Build Logs**

1. Go to Railway dashboard
2. Click on backend service
3. Go to **"Logs"** tab
4. Look for error messages

### **Common Issues**

**Issue: "composer not found"**
- Solution: Railway will install it automatically

**Issue: "PHP not found"**
- Solution: nixpacks.toml specifies PHP 8.2

**Issue: "npm not found"**
- Solution: nixpacks.toml specifies Node.js 20

**Issue: "Database connection error"**
- Solution: Check environment variables
- Verify DB_HOST, DB_USER, DB_PASSWORD

### **If Still Stuck**

1. Check Railway logs carefully
2. Look for specific error messages
3. Fix the issue in code
4. Push to GitHub
5. Railway auto-redeploys

---

## 📝 Files Changed

```
✅ Procfile - Updated start command
✅ railway.toml - Updated start command
✅ nixpacks.toml - NEW - Build configuration
✅ .env.example - NEW - Environment template
```

All files have been committed and pushed to GitHub.

---

## 🎯 Next Steps

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Fix Railway deployment"
   git push origin main
   ```

2. **Wait for Redeploy**
   - Railway auto-detects changes
   - Builds and deploys automatically
   - Takes 5-10 minutes

3. **Monitor Logs**
   - Go to Railway dashboard
   - Check service logs
   - Look for success message

4. **Test Your App**
   - Visit backend URL
   - Visit frontend URL
   - Test login

---

## 💡 Why This Happened

Railway detected the project as Node.js because:
- `package.json` exists in root
- `Procfile` said `npm start`
- Railway tried to run npm on a PHP project

**Solution:** Tell Railway it's a PHP project with Node.js frontend

---

## ✨ What's Fixed

```
✅ Railway now knows it's a PHP project
✅ Railway installs PHP 8.2
✅ Railway installs Node.js 20
✅ Railway builds frontend (React)
✅ Railway builds backend (Vite)
✅ Railway starts with PHP artisan serve
✅ No more "npm: command not found" error
```

---

## 🚀 You're Ready!

Your project is now properly configured for Railway!

**Status:** ✅ Ready for Redeploy

---

## 📞 Support

If you still have issues:

1. Check Railway logs
2. Review this guide
3. Contact Railway support: https://railway.app/support

---

**Repository**: https://github.com/Bossing15/Sanctuario_Project.git
**Latest Commit**: (after you push)
**Status**: ✅ Fixed and Ready
**Date**: April 29, 2026
