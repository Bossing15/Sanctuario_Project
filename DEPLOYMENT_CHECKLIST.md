# Render Deployment Checklist

## Pre-Deployment ✅
- [x] Code committed to GitHub
- [x] Latest changes pushed
- [x] Render.yaml created
- [x] Procfile created
- [x] Deployment guide created

## Render Setup
- [ ] Create Render account (https://render.com)
- [ ] Connect GitHub account to Render
- [ ] Create MySQL database on Render
  - [ ] Save database credentials
  - [ ] Note the host, port, username, password

## Backend Deployment
- [ ] Create Web Service for backend
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables (see guide)
- [ ] Deploy backend
- [ ] Wait for build to complete
- [ ] Note backend URL: `https://sanctuario-backend.onrender.com`
- [ ] Run migrations via Shell:
  ```bash
  php artisan migrate --force
  php artisan db:seed --force
  ```

## Frontend Deployment
- [ ] Create Web Service for frontend
- [ ] Set build command: `cd client-app && npm install && npm run build`
- [ ] Set start command: `cd client-app && npm run serve`
- [ ] Add environment variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=3002
  - [ ] REACT_APP_API_URL=<backend-url>
- [ ] Deploy frontend
- [ ] Wait for build to complete
- [ ] Note frontend URL: `https://sanctuario-client.onrender.com`

## Post-Deployment
- [ ] Update backend APP_CLIENT_URL to frontend URL
- [ ] Test backend API: `curl https://sanctuario-backend.onrender.com/api/health`
- [ ] Visit frontend: `https://sanctuario-client.onrender.com`
- [ ] Test login functionality
- [ ] Test API calls from frontend
- [ ] Check browser console for errors
- [ ] Check Render logs for issues

## Optional (Production)
- [ ] Upgrade from free tier to Starter plan
- [ ] Set up custom domain
- [ ] Enable auto-deploy on GitHub push
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Set up SSL/TLS (automatic on Render)

## Troubleshooting
- [ ] Check build logs if deployment fails
- [ ] Verify database credentials
- [ ] Check CORS settings in Laravel
- [ ] Verify environment variables are set correctly
- [ ] Check frontend can reach backend API

---

## Quick Links
- Render Dashboard: https://dashboard.render.com
- GitHub Repository: https://github.com/Bossing15/Sanctuario_Project.git
- Deployment Guide: See RENDER_DEPLOYMENT_GUIDE.md

---

## Support
If you encounter issues:
1. Check the deployment logs in Render dashboard
2. Review RENDER_DEPLOYMENT_GUIDE.md
3. Check GitHub issues
4. Contact Render support: https://render.com/support
