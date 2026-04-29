# Forgot Password Implementation - Complete Guide

## Overview
The forgot password feature has been fully integrated with Resend email API for both client and admin users in the Sanctuario De Carmona system.

## What Was Implemented

### 1. Backend (Laravel)

#### AuthController.php
- **forgotPassword()** method:
  - Validates email exists in clients or admins table
  - Generates unique reset token
  - Stores token in cache (expires in 1 hour)
  - Sends email via Resend with reset link
  - Returns success/error response

- **resetPassword()** method:
  - Validates reset token from cache
  - Verifies passwords match
  - Updates user password (hashed with bcrypt)
  - Deletes token from cache
  - Returns success message

- **getPasswordResetEmailTemplate()** method:
  - Generates professional HTML email
  - Includes reset button and plain text link
  - Shows security notice about expiration
  - Personalized with user's name

#### Routes (routes/api.php)
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

### 2. Frontend (React)

#### ForgotPasswordModal.jsx
- Modal component for forgot password flow
- Two-step process:
  1. Email entry step
  2. Confirmation step after email sent
- Loading states and error handling
- Success message with email confirmation

#### ForgotPasswordModal.css
- Professional modal styling
- Smooth animations (fade-in, slide-up)
- Responsive design for mobile
- Success state with checkmark icon
- Error and success message styling

#### LoginPage.jsx Updates
- Imported ForgotPasswordModal component
- Added state for modal visibility
- Updated "Forgot your password?" button to open modal
- Integrated modal into login page

### 3. Email Configuration

#### Resend Integration
- Package: `resend/resend-php` (v1.3.0)
- API key stored in `.env` as `RESEND_API_KEY`
- From address: `noreply@sanctuario.com`
- Frontend URL: `FRONTEND_URL` env variable

## How to Use

### For Users

1. **Request Password Reset**
   - Click "Forgot your password?" on login page
   - Enter email address
   - Click "Send Reset Link"
   - Check email for reset link

2. **Reset Password**
   - Click link in email (valid for 1 hour)
   - Enter new password
   - Confirm password
   - Click "Reset Password"
   - Log in with new password

### For Developers

#### Setup
1. Install Resend package (already done):
   ```bash
   composer require resend/resend-php
   ```

2. Add to `.env`:
   ```env
   RESEND_API_KEY=your_api_key_here
   FRONTEND_URL=http://localhost:3002
   ```

3. Get API key from https://resend.com

#### Testing
```bash
# Test forgot password endpoint
curl -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Test reset password endpoint
curl -X POST http://localhost:8000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"reset_token_here",
    "password":"newpassword",
    "password_confirmation":"newpassword"
  }'
```

## File Structure

```
Sanctuario_Project/
├── app/Http/Controllers/
│   └── AuthController.php (updated)
├── routes/
│   └── api.php (updated)
├── client-app/src/
│   ├── pages/
│   │   └── LoginPage.jsx (updated)
│   └── components/
│       ├── ForgotPasswordModal.jsx (new)
│       └── ForgotPasswordModal.css (new)
└── RESEND_EMAIL_SETUP.md (new)
```

## Security Features

### Token Management
- Unique tokens generated per request
- Stored in cache (not database)
- Expires after 1 hour
- Deleted after successful reset
- One-time use only

### Password Security
- Minimum 6 characters
- Hashed with bcrypt
- Confirmation required
- Old password not needed (security best practice)

### Email Verification
- Email must exist in system
- Works for both clients and admins
- Case-insensitive lookup
- Proper error messages

### Rate Limiting (Optional)
Can be added to prevent abuse:
```php
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:5,15');
```

## Email Template

The email includes:
- Professional header with gradient background
- Personalized greeting
- Clear call-to-action button
- Plain text link as fallback
- Security notice about expiration
- Footer with company info

### Customization
Edit `getPasswordResetEmailTemplate()` in AuthController.php to:
- Change colors
- Update text
- Add company logo
- Modify layout

## Error Handling

### Frontend
- Network errors caught and displayed
- Loading states prevent double submission
- Clear error messages to user
- Success confirmation before closing

### Backend
- Email validation
- User existence check
- Token validation
- Password matching
- Detailed logging for debugging

## Logging

All password reset activities are logged:
```
[2026-04-29] Password reset email sent
[2026-04-29] Password reset successful
[2026-04-29] Failed to send password reset email
```

Check logs:
```bash
tail -f storage/logs/laravel.log
```

## Testing Checklist

- [ ] Forgot password modal opens
- [ ] Email validation works
- [ ] Email sent successfully
- [ ] Email received in inbox
- [ ] Reset link works
- [ ] Token validation works
- [ ] Password update works
- [ ] Can log in with new password
- [ ] Expired token rejected
- [ ] Invalid token rejected
- [ ] Passwords must match
- [ ] Works for both clients and admins

## Troubleshooting

### Email Not Received
1. Check spam folder
2. Verify email address
3. Check Laravel logs
4. Verify Resend API key

### Token Expired
- Tokens expire after 1 hour
- User must request new reset link

### Password Reset Failed
- Check password requirements (min 6 chars)
- Verify passwords match
- Check user exists in system

## Future Enhancements

1. **Email Templates**: Use Resend's template feature
2. **Rate Limiting**: Add throttling
3. **SMS Fallback**: Send code via SMS
4. **Multi-language**: Support multiple languages
5. **Admin Dashboard**: Track reset requests
6. **Audit Trail**: Log all password changes

## Support

For issues or questions:
1. Check RESEND_EMAIL_SETUP.md
2. Review Laravel logs
3. Test with Resend sandbox email: `delivered@resend.dev`
4. Verify API key and environment variables

## References

- Resend Docs: https://resend.com/docs
- Resend PHP SDK: https://github.com/resendlabs/resend-php
- Laravel Mail: https://laravel.com/docs/mail
- Laravel Cache: https://laravel.com/docs/cache
