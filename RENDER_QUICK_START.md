# Render Deployment - Quick Start (5 Steps)

## Step 1: Create Render Account
1. Go to https://render.com
2. Click **"Sign up with GitHub"**
3. Authorize Render

## Step 2: Create MySQL Database
1. Dashboard → **"New +"** → **"MySQL"**
2. Name: `sanctuario-db`
3. Database: `sanctuario`
4. User: `sanctuario_user`
5. Click **"Create Database"**
6. **⚠️ SAVE these credentials:**
   - Host
   - Port
   - Database
   - Username
   - Password

## Step 3: Deploy Backend
1. Dashboard → **"New +"** → **"Web Service"**
2. Select: **`Bossing15/Sanctuario_Project`**
3. **Name**: `sanctuario-backend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. Click **"Environment"** and add these variables:

```
APP_NAME=Sanctuario
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:8sJZ19eM4swYKmfeXRSDywYWbOfH0koJ09fbz3vqo30=
APP_URL=https://sanctuario-backend.onrender.com
APP_CLIENT_URL=https://sanctuario-client.onrender.com

DB_CONNECTION=mysql
DB_HOST=<your-db-host>
DB_PORT=3306
DB_DATABASE=sanctuario
DB_USERNAME=sanctuario_user
DB_PASSWORD=<your-db-password>

LOG_CHANNEL=stack
BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="Sanctuario"

FRONTEND_URL=https://sanctuario-client.onrender.com
```

7. Click **"Create Web Service"**
8. ⏳ Wait 5-10 minutes for build

## Step 4: Run Database Migrations
1. Go to backend service → **"Shell"** tab
2. Run these commands:
```bash
php artisan migrate --force
php artisan db:seed --force
```

## Step 5: Deploy Frontend
1. Dashboard → **"New +"** → **"Web Service"**
2. Select: **`Bossing15/Sanctuario_Project`**
3. **Name**: `sanctuario-client`
4. **Build Command**: `cd client-app && npm install && npm run build`
5. **Start Command**: `cd client-app && npm run serve`
6. Click **"Environment"** and add:

```
NODE_ENV=production
PORT=3002
REACT_APP_API_URL=https://sanctuario-backend.onrender.com
```

7. Click **"Create Web Service"**
8. ⏳ Wait 5-10 minutes for build

---

## ✅ Done!

Your application is now live:
- **Backend**: https://sanctuario-backend.onrender.com
- **Frontend**: https://sanctuario-client.onrender.com

---

## Test It
1. Visit: https://sanctuario-client.onrender.com
2. Try logging in
3. Check if everything works

---

## Troubleshooting

### Build Failed?
- Check logs in Render dashboard
- Ensure all environment variables are set
- Verify database credentials

### Can't Connect to Database?
- Check DB credentials in environment variables
- Verify database is running
- Check Render logs

### Frontend Can't Reach Backend?
- Verify `REACT_APP_API_URL` is correct
- Check backend is running
- Check browser console for errors

---

## Need Help?
- Full guide: See `RENDER_DEPLOYMENT_GUIDE.md`
- Checklist: See `DEPLOYMENT_CHECKLIST.md`
- Render docs: https://render.com/docs

---

**Repository**: https://github.com/Bossing15/Sanctuario_Project.git
**Latest Commit**: 3ec4ea0
