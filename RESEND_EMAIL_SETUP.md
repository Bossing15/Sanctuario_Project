# Resend Email API Integration - Setup Guide

## Overview
This guide explains how to set up and use the Resend email API for the forgot password feature in Sanctuario De Carmona.

## Prerequisites
- Resend account (sign up at https://resend.com)
- Resend API key
- Laravel environment configured

## Installation

The Resend PHP package has already been installed via Composer:
```bash
composer require resend/resend-php
```

## Configuration

### 1. Add Resend API Key to .env

Add your Resend API key to your `.env` file:

```env
RESEND_API_KEY=your_resend_api_key_here
FRONTEND_URL=http://localhost:3002
```

### 2. Update Laravel Configuration

The Resend package should be automatically available. If you need to configure it, add to `config/services.php`:

```php
'resend' => [
    'key' => env('RESEND_API_KEY'),
],
```

## API Endpoints

### Forgot Password Endpoint
**POST** `/api/forgot-password`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response (success):
```json
{
  "message": "Password reset link has been sent to your email. Please check your inbox.",
  "success": true
}
```

Response (error):
```json
{
  "message": "Email not found",
  "error": "..."
}
```

### Reset Password Endpoint
**POST** `/api/reset-password`

Request body:
```json
{
  "token": "reset_token_from_email",
  "password": "new_password",
  "password_confirmation": "new_password"
}
```

Response (success):
```json
{
  "message": "Password has been reset successfully. You can now log in with your new password.",
  "success": true
}
```

## How It Works

### 1. User Requests Password Reset
- User clicks "Forgot your password?" on login page
- Enters their email address in the modal
- Frontend sends POST request to `/api/forgot-password`

### 2. Backend Processes Request
- Validates email exists in clients or admins table
- Generates a unique reset token
- Stores token in cache (expires in 1 hour)
- Sends email via Resend with reset link

### 3. Email Template
The email includes:
- Personalized greeting with user's name
- Reset button with link
- Plain text link as fallback
- Security notice about link expiration
- Professional branding

### 4. User Clicks Reset Link
- Link format: `http://localhost:3002/reset-password?token=TOKEN`
- Frontend extracts token from URL
- User enters new password
- Frontend sends POST to `/api/reset-password`

### 5. Backend Validates and Updates
- Validates reset token exists in cache
- Verifies passwords match
- Updates user's password
- Deletes token from cache
- Returns success message

## Email Configuration

### From Address
Currently set to: `noreply@sanctuario.com`

To use a verified domain with Resend:
1. Go to Resend dashboard
2. Add and verify your domain
3. Update the `from` address in `AuthController.php`

### Email Template
The email template is generated in the `getPasswordResetEmailTemplate()` method in `AuthController.php`.

To customize:
- Edit the HTML template in the method
- Update colors, text, or layout as needed
- Ensure links are properly formatted

## Testing

### Test with Resend Sandbox
Resend provides a sandbox email for testing:
- Email: `delivered@resend.dev`
- This email will always receive emails in sandbox mode

### Test Locally
1. Set `RESEND_API_KEY` in `.env`
2. Use the Forgot Password modal in login page
3. Check email for reset link
4. Click link and reset password

### Debugging
Check Laravel logs for email sending:
```bash
tail -f storage/logs/laravel.log
```

Look for entries like:
- "Password reset email sent"
- "Failed to send password reset email"

## Security Considerations

### Token Expiration
- Reset tokens expire after 1 hour
- Tokens are stored in cache (not database)
- Tokens are deleted after successful password reset

### Email Verification
- Email must exist in system
- Both client and admin accounts supported
- Case-insensitive email lookup

### Password Requirements
- Minimum 6 characters
- Must match confirmation password
- Hashed using Laravel's Hash facade (bcrypt)

### Rate Limiting
Consider adding rate limiting to prevent abuse:
```php
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:5,15'); // 5 requests per 15 minutes
```

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Check Laravel logs for errors
4. Verify Resend API key is correct

### Invalid Token Error
1. Token may have expired (1 hour limit)
2. User may have already reset password
3. Token may be malformed

### CORS Issues
If frontend can't reach API:
1. Verify `FRONTEND_URL` in `.env`
2. Check CORS middleware configuration
3. Ensure API is running on correct port

## Future Enhancements

1. **Email Templates**: Use Resend's template feature for better management
2. **Rate Limiting**: Add throttling to prevent abuse
3. **Email Verification**: Verify email before allowing password reset
4. **Multi-language**: Support multiple languages in email
5. **SMS Fallback**: Send reset code via SMS as alternative
6. **Admin Dashboard**: Track password reset requests

## References

- Resend Documentation: https://resend.com/docs
- Resend PHP SDK: https://github.com/resendlabs/resend-php
- Laravel Mail: https://laravel.com/docs/mail
