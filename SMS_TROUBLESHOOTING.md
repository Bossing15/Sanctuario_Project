# SMS Management - Troubleshooting Guide

## Issue: CORS Errors When Accessing SMS

### Symptoms
```
Access to fetch at 'http://localhost:8000/api/sms/...' from origin 'http://127.0.0.1:8000' 
has been blocked by CORS policy
```

### Solution
1. **Hard refresh the browser** (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)
2. **Clear browser cache** (DevTools → Application → Clear Storage)
3. **Restart Laravel server** if changes don't take effect
4. **Check that CORS middleware is applied** to API routes

### What Was Fixed
- Updated `app/Http/Middleware/Cors.php` to intelligently detect local development origins
- Now accepts any `localhost` or `127.0.0.1` origin regardless of port
- SMS routes protected with `auth:sanctum` middleware

---

## Issue: "Error Sending SMS" Message

### Symptoms
- SMS form shows "Error sending SMS" after clicking Send
- No SMS is sent
- Error appears in browser console

### Possible Causes & Solutions

#### 1. Invalid Phone Number Format
**Error**: "Invalid phone number format"
- **Solution**: Use one of these formats:
  - `+63912345678` (with country code)
  - `09123456789` (Philippine format)
  - `63912345678` (country code without +)
- **Must have**: 9-10 digits after country code

#### 2. Empty Message
**Error**: "Message cannot be empty"
- **Solution**: Type a message before sending
- **Limit**: 160 characters (SMS standard)

#### 3. SMS API Key Not Configured
**Error**: "SMS API key not configured"
- **Solution**: Check `.env` file has:
  ```
  SMS_API_KEY=4dcfd6ecbf34adbd2e5a3173699ff0d9
  SMS_PROVIDER=semaphore
  SMS_FROM_NAME=Sanctuario
  ```
- **Restart**: Laravel server after changing `.env`

#### 4. Out of SMS Credits
**Error**: "SMS API error" or "Failed to send SMS"
- **Solution**: Check SMS balance in SMS Management → Balance tab
- **Action**: Purchase more SMS credits from Semaphore

#### 5. Network/Connection Error
**Error**: "Failed to fetch" or "TypeError: Failed to fetch"
- **Solution**:
  1. Check internet connection
  2. Verify Laravel server is running
  3. Check that API endpoint is accessible
  4. Hard refresh browser

---

## Issue: SMS Logs Not Loading

### Symptoms
- SMS Logs tab shows loading spinner indefinitely
- Or shows "No SMS logs found"

### Solutions
1. **Check authentication**: Ensure you're logged in as admin
2. **Check API endpoint**: Verify `/api/sms/logs` is accessible
3. **Check database**: Ensure SMS logs table exists
4. **Hard refresh**: Clear browser cache and reload

---

## Issue: Balance Not Showing

### Symptoms
- Balance tab shows "Unable to fetch balance"
- Or shows loading spinner indefinitely

### Solutions
1. **Check API key**: Verify `SMS_API_KEY` in `.env` is correct
2. **Check Semaphore account**: Log in to Semaphore to verify account status
3. **Check internet**: Ensure connection to Semaphore API
4. **Restart server**: Laravel may need restart after `.env` changes

---

## Issue: Clients List Not Loading

### Symptoms
- "Quick Select Clients" section is empty
- Or shows loading spinner indefinitely

### Solutions
1. **Check database**: Ensure clients exist in database
2. **Check authentication**: Verify you're logged in as admin
3. **Check API**: Verify `/api/sms/clients` endpoint works
4. **Hard refresh**: Clear cache and reload page

---

## Issue: Payment Reminders Not Sending

### Symptoms
- Click "Send Payment Reminders" but nothing happens
- Or shows error message

### Solutions
1. **Check payment data**: Ensure clients have payment plans with due dates
2. **Check days setting**: Verify "days until due" is set correctly
3. **Check API**: Verify `/api/sms/send-payment-reminders` endpoint works
4. **Check logs**: Look at SMS Logs tab to see if reminders were sent

---

## Testing Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Verify logged in as admin
- [ ] Check SMS API key in `.env`
- [ ] Verify Laravel server is running
- [ ] Test with valid phone number (+63912345678)
- [ ] Check SMS balance
- [ ] View SMS logs to confirm sending
- [ ] Test bulk SMS with multiple numbers
- [ ] Test payment reminders

---

## Debug Steps

### 1. Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for error messages
- Check Network tab for failed requests

### 2. Check Laravel Logs
```bash
tail -f storage/logs/laravel.log
```

### 3. Check Database
```bash
# Connect to MySQL
mysql -u root sanctuario

# Check SMS logs table
SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT 10;

# Check clients table
SELECT id, name, phone FROM clients LIMIT 10;
```

### 4. Test API Endpoint Directly
```bash
# Test SMS send endpoint
curl -X POST http://localhost:8000/api/sms/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+63912345678",
    "message": "Test message"
  }'

# Test balance endpoint
curl -X GET http://localhost:8000/api/sms/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| CORS errors | Hard refresh + clear cache |
| SMS not sending | Check phone format + API key |
| Balance not showing | Restart Laravel server |
| Logs not loading | Check authentication |
| Clients not loading | Verify clients exist in DB |
| Payment reminders not working | Check payment data exists |

---

## Support

If issues persist:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for errors
3. Verify all configuration in `.env`
4. Restart Laravel server
5. Hard refresh browser
6. Clear browser cache completely

