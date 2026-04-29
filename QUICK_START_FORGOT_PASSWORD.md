# Forgot Password Feature - Quick Start Guide

## 🚀 How to Use

### For Users

#### 1. Request Password Reset
1. Go to login page
2. Click "Forgot Password" link
3. Enter your email address
4. Click "Send Reset Link"
5. Check your email for reset link

#### 2. Reset Your Password
1. Click the reset link in your email
2. Enter your new password
3. Confirm your new password
4. Click "Reset Password"
5. You'll be redirected to login
6. Login with your new password

---

## 🔧 For Developers

### Testing the Feature

#### Test 1: Request Password Reset
```bash
curl -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3002" \
  -d '{"email":"user@example.com"}'
```

**Expected Response (200):**
```json
{
  "message": "Password reset link has been sent to your email. Please check your inbox.",
  "success": true
}
```

#### Test 2: Reset Password
```bash
curl -X POST http://localhost:8000/api/reset-password \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3002" \
  -d '{
    "token": "your_reset_token_here",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Password has been reset successfully. You can now log in with your new password.",
  "success": true
}
```

---

## 📧 Email Configuration

### Current Setup (Development)
- **Email Sender**: `onboarding@resend.dev` (Resend test domain)
- **API Key**: `re_irNrQsbr_FdqbpuJmPKx5bq1827us9a24`
- **Frontend URL**: `http://localhost:3002`

### For Production
1. Go to https://resend.com/domains
2. Add your domain (e.g., `sanctuario.com`)
3. Verify DNS records
4. Update `.env`:
   ```
   RESEND_API_KEY=your_production_key
   FRONTEND_URL=https://yourdomain.com
   ```
5. Update email sender in `AuthController.php`:
   ```php
   'from' => 'noreply@yourdomain.com',
   ```

---

## 🔐 Security Features

- ✅ **Token Expiration**: 1 hour
- ✅ **One-Time Use**: Token deleted after use
- ✅ **Secure Hashing**: Bcrypt password hashing
- ✅ **CORS Protection**: Only allows authorized origins
- ✅ **Input Validation**: Both frontend and backend

---

## 📁 File Locations

### Backend
- `app/Http/Controllers/AuthController.php` - Password reset logic
- `routes/api.php` - API endpoints

### Frontend
- `client-app/src/pages/ResetPasswordPage.jsx` - Reset password page
- `client-app/src/pages/ResetPasswordPage.css` - Reset page styling
- `client-app/src/components/ForgotPasswordModal.jsx` - Forgot password modal
- `client-app/src/App.jsx` - Routes

---

## 🐛 Troubleshooting

### Email Not Received
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Look for Resend API errors
grep -i "resend\|email" storage/logs/laravel.log
```

### Reset Link Not Working
- Verify token is in URL: `/reset-password?token=abc123...`
- Check token hasn't expired (1 hour limit)
- Verify cache table exists: `php artisan migrate`

### CORS Errors
```bash
# Clear cache and restart
php artisan cache:clear
php artisan serve --host=localhost --port=8000
```

---

## 📊 API Endpoints

### POST /api/forgot-password
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success (200):**
```json
{
  "message": "Password reset link has been sent to your email. Please check your inbox.",
  "success": true
}
```

**Error (404):**
```json
{
  "message": "Email not found"
}
```

### POST /api/reset-password
**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Success (200):**
```json
{
  "message": "Password has been reset successfully. You can now log in with your new password.",
  "success": true
}
```

**Error (401):**
```json
{
  "message": "Invalid or expired reset token"
}
```

---

## 🎯 Key Features

1. **Secure Token Generation**
   - 60-character random token
   - Unique per request
   - Stored in cache (not database)

2. **Professional Email**
   - HTML template with gradient header
   - Personalized greeting
   - Reset button and plain text link
   - Security notice

3. **User-Friendly Interface**
   - Modal for requesting reset
   - Full page for resetting password
   - Show/hide password toggles
   - Clear error messages

4. **Responsive Design**
   - Works on desktop and mobile
   - Touch-friendly buttons
   - Readable on all screen sizes

---

## ✅ Verification Checklist

- [ ] Forgot password modal appears on login page
- [ ] Email is sent when requesting reset
- [ ] Reset link works and opens reset page
- [ ] Password validation works
- [ ] New password is accepted
- [ ] User can login with new password
- [ ] Token expires after 1 hour
- [ ] Invalid tokens show error message

---

## 📞 Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for errors
3. Verify environment variables in `.env`
4. Test API endpoints with curl
5. Check Resend dashboard for email delivery status

---

## 🚀 Next Steps

1. **Test the feature** - Follow the testing steps above
2. **Deploy to production** - Update configuration for production
3. **Monitor logs** - Watch for any errors
4. **Gather feedback** - Get user feedback on the feature
5. **Enhance** - Add rate limiting, 2FA, etc.

---

**Last Updated**: April 29, 2026  
**Status**: ✅ Ready for Production
