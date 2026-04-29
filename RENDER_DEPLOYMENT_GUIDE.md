# Sanctuario Project - Render Deployment Guide

## Project Structure
- **Backend**: Laravel (PHP) - Main API server
- **Frontend**: React - Client application
- **Database**: MySQL

---

## Step 1: Prepare Your GitHub Repository

✅ **Already Done:**
- Latest changes committed and pushed to GitHub
- Commit: `b01e9c9`

---

## Step 2: Create Render Account & Connect GitHub

1. Go to https://render.com
2. Click **"Sign up"** → Choose **"Sign up with GitHub"**
3. Authorize Render to access your GitHub account
4. Click **"Authorize render-oss"**

---

## Step 3: Create MySQL Database on Render

1. In Render Dashboard, click **"New +"** → **"MySQL"**
2. Configure:
   - **Name**: `sanctuario-db`
   - **Database**: `sanctuario`
   - **User**: `sanctuario_user`
   - **Region**: Choose closest to your location
   - **Plan**: Free (or Starter for production)
3. Click **"Create Database"**
4. **Save these credentials** - you'll need them for environment variables:
   - Host
   - Port (usually 3306)
   - Database name
   - Username
   - Password

---

## Step 4: Deploy Backend (Laravel)

### 4.1 Create Web Service for Backend

1. Click **"New +"** → **"Web Service"**
2. Select **"Deploy an existing repository"**
3. Search and select: **`Bossing15/Sanctuario_Project`**
4. Click **"Connect"**

### 4.2 Configure Backend Service

**Basic Settings:**
- **Name**: `sanctuario-backend`
- **Environment**: `Node`
- **Region**: Same as database
- **Branch**: `main`
- **Build Command**:
  ```
  npm install && npm run build
  ```
- **Start Command**:
  ```
  npm start
  ```

### 4.3 Add Environment Variables

Click **"Environment"** and add these variables:

```
APP_NAME=Sanctuario
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:8sJZ19eM4swYKmfeXRSDywYWbOfH0koJ09fbz3vqo30=
APP_URL=https://sanctuario-backend.onrender.com
APP_CLIENT_URL=https://sanctuario-client.onrender.com

DB_CONNECTION=mysql
DB_HOST=<your-render-db-host>
DB_PORT=3306
DB_DATABASE=sanctuario
DB_USERNAME=sanctuario_user
DB_PASSWORD=<your-render-db-password>

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

RESEND_API_KEY=YOUR_RESEND_API_KEY
FRONTEND_URL=https://sanctuario-client.onrender.com

PAYMONGO_ENVIRONMENT=test
PAYMONGO_TEST_PUBLIC_KEY=pk_test_YOUR_TEST_PUBLIC_KEY
PAYMONGO_TEST_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY

SMS_API_KEY=YOUR_SMS_API_KEY
SMS_PROVIDER=semaphore
SMS_FROM_NAME=Sanctuario
```

### 4.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Once deployed, note the URL: `https://sanctuario-backend.onrender.com`

### 4.5 Run Database Migrations

After backend is deployed:

1. Go to backend service → **"Shell"** tab
2. Run:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```

---

## Step 5: Deploy Frontend (React Client)

### 5.1 Create Web Service for Frontend

1. Click **"New +"** → **"Web Service"**
2. Select **"Deploy an existing repository"**
3. Search and select: **`Bossing15/Sanctuario_Project`**
4. Click **"Connect"**

### 5.2 Configure Frontend Service

**Basic Settings:**
- **Name**: `sanctuario-client`
- **Environment**: `Node`
- **Region**: Same as backend
- **Branch**: `main`
- **Build Command**:
  ```
  cd client-app && npm install && npm run build
  ```
- **Start Command**:
  ```
  cd client-app && npm run serve
  ```

### 5.3 Add Environment Variables

Click **"Environment"** and add:

```
NODE_ENV=production
PORT=3002
REACT_APP_API_URL=https://sanctuario-backend.onrender.com
```

### 5.4 Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Once deployed, note the URL: `https://sanctuario-client.onrender.com`

---

## Step 6: Update Backend Environment Variables

After frontend is deployed, update the backend's `APP_CLIENT_URL`:

1. Go to backend service → **"Environment"**
2. Update `APP_CLIENT_URL` to: `https://sanctuario-client.onrender.com`
3. Click **"Save"** - this will trigger a redeploy

---

## Step 7: Verify Deployment

### Test Backend API
```bash
curl https://sanctuario-backend.onrender.com/api/health
```

### Test Frontend
Visit: `https://sanctuario-client.onrender.com`

### Test Login
1. Go to login page
2. Try logging in with test credentials
3. Check if API calls work

---

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### Database Connection Error
- Verify DB credentials in environment variables
- Check if database is running
- Ensure firewall allows connections

### Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in Laravel
- Ensure backend is running

### Port Issues
- Render assigns ports automatically
- Don't hardcode ports in code
- Use environment variables for ports

---

## Important Notes

⚠️ **Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- Limited to 750 hours/month
- No custom domains (unless upgraded)

✅ **For Production:**
- Upgrade to Starter or higher plan
- Use custom domain
- Enable auto-deploy on GitHub push
- Set up monitoring and alerts

---

## Useful Commands

### View Logs
```bash
# In Render dashboard, go to service → Logs
```

### SSH into Service
```bash
# In Render dashboard, go to service → Shell
```

### Restart Service
```bash
# In Render dashboard, click "Restart Service"
```

---

## Next Steps

1. ✅ Create Render account
2. ✅ Create MySQL database
3. ✅ Deploy backend
4. ✅ Deploy frontend
5. ✅ Run migrations
6. ✅ Test application
7. ✅ Set up custom domain (optional)
8. ✅ Enable auto-deploy (optional)

---

## Support

For issues:
- Check Render documentation: https://render.com/docs
- Review deployment logs in Render dashboard
- Check GitHub repository for latest code

---

**Last Updated**: April 29, 2026
**Project**: Sanctuario Memorial Park
**Repository**: https://github.com/Bossing15/Sanctuario_Project.git
