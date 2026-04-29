# SMS CORS Error - Complete Debug Guide

## Current Status
CORS middleware has been updated and simplified. The issue is likely a caching problem.

## Step-by-Step Debug & Fix

### Step 1: Clear All Caches

#### Clear Laravel Cache
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Or use this command to clear everything
php artisan optimize:clear
```

#### Clear Browser Cache
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear Storage**
4. Select all checkboxes
5. Click **Clear site data**

#### Hard Refresh Browser
- Windows/Linux: **Ctrl+Shift+R**
- Mac: **Cmd+Shift+R**

### Step 2: Restart Everything

```bash
# Stop Laravel server (Ctrl+C)
# Stop any other running processes

# Clear config cache
php artisan config:clear

# Restart Laravel server
php artisan serve
```

### Step 3: Test CORS with curl

Test if CORS headers are being sent:

```bash
# Test OPTIONS preflight request
curl -X OPTIONS http://localhost:8000/api/sms/send \
  -H "Origin: http://127.0.0.1:8000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v

# Look for these headers in response:
# Access-Control-Allow-Origin: http://127.0.0.1:8000
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
# Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
```

### Step 4: Check Browser Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Go to SMS Management
4. Try sending an SMS
5. Look for **OPTIONS** request to `/api/sms/send`
6. Click on it and check **Response Headers**
7. Should see:
   - `Access-Control-Allow-Origin: http://127.0.0.1:8000`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD`
   - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin`

### Step 5: Check Laravel Logs

```bash
# Watch logs in real-time
tail -f storage/logs/laravel.log

# Or check the latest log file
cat storage/logs/laravel.log | tail -50
```

Look for any errors related to:
- CORS
- Authentication
- SMS routes

### Step 6: Test API Endpoint Directly

```bash
# Get your auth token first (from browser localStorage)
# Then test the endpoint

curl -X GET http://localhost:8000/api/sms/clients \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Origin: http://127.0.0.1:8000" \
  -v
```

## Common Issues & Solutions

### Issue 1: CORS Headers Not Appearing
**Symptom**: OPTIONS request returns 200 but no CORS headers

**Solution**:
1. Clear Laravel cache: `php artisan optimize:clear`
2. Restart Laravel server
3. Hard refresh browser
4. Check if middleware is applied in `bootstrap/app.php`

### Issue 2: 401 Unauthorized on Actual Request
**Symptom**: OPTIONS works but POST/GET fails with 401

**Solution**:
1. Check auth token is valid
2. Check token is being sent in Authorization header
3. Verify token hasn't expired
4. Check localStorage for authToken

### Issue 3: 500 Internal Server Error
**Symptom**: OPTIONS or actual request returns 500

**Solution**:
1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Look for PHP errors
3. Check database connection
4. Verify SMS API key in `.env`

### Issue 4: CORS Headers Present but Still Blocked
**Symptom**: Headers are there but browser still blocks request

**Solution**:
1. Check origin matches exactly (case-sensitive)
2. Check credentials flag is set
3. Verify all required headers are allowed
4. Try from different browser/incognito window

## Verification Checklist

- [ ] Laravel cache cleared (`php artisan optimize:clear`)
- [ ] Browser cache cleared (DevTools → Application → Clear Storage)
- [ ] Browser hard refreshed (Ctrl+Shift+R)
- [ ] Laravel server restarted
- [ ] OPTIONS request returns 200
- [ ] OPTIONS response has CORS headers
- [ ] POST/GET request has Authorization header
- [ ] Auth token is valid
- [ ] SMS API key is set in `.env`

## Files Modified

### `app/Http/Middleware/Cors.php`
- Simplified CORS handling
- Better OPTIONS request handling
- Added Origin to allowed headers
- Increased Max-Age to 86400

### `routes/api.php`
- SMS routes use `auth:sanctum` middleware
- CORS is applied globally via middleware

### `bootstrap/app.php`
- CORS middleware prepended to API routes

## Testing SMS After Fix

1. **Hard refresh** browser (Ctrl+Shift+R)
2. **Clear cache** (DevTools → Application → Clear Storage)
3. **Restart Laravel** server
4. Go to **SMS Management**
5. Try **sending an SMS**
6. Should work without CORS errors

## If Still Not Working

### Option 1: Check Middleware Order
Verify in `bootstrap/app.php`:
```php
$middleware->api(prepend: [
    \App\Http\Middleware\Cors::class,  // Should be first
]);
```

### Option 2: Test with Simple Endpoint
Create a test endpoint without auth:
```php
Route::get('/api/test-cors', function() {
    return response()->json(['message' => 'CORS working']);
});
```

Then test:
```bash
curl -X GET http://localhost:8000/api/test-cors \
  -H "Origin: http://127.0.0.1:8000" \
  -v
```

### Option 3: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for CORS error messages
4. Copy exact error message
5. Check if origin matches exactly

## Advanced Debugging

### Enable CORS Logging
Add to `app/Http/Middleware/Cors.php`:
```php
\Illuminate\Support\Facades\Log::info('CORS Request', [
    'origin' => $origin,
    'method' => $request->getMethod(),
    'path' => $request->path(),
    'allow_origin' => $allowOrigin,
]);
```

### Check Middleware Stack
```bash
php artisan route:list | grep sms
```

Should show SMS routes with `auth:sanctum` middleware.

## Summary

The CORS issue is typically caused by:
1. **Caching** - Laravel or browser cache not cleared
2. **Middleware order** - CORS not running before auth
3. **Headers mismatch** - Origin doesn't match exactly
4. **Token issues** - Auth token missing or expired

**Most common fix**: Clear all caches and restart server.

