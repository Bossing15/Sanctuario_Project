# SMS API Integration - Semaphore

## Overview
The system now integrates with Semaphore SMS API for sending SMS messages to users and payment reminders.

## Configuration

### Environment Variables
Add to `.env`:
```
SMS_API_KEY=4dcfd6ecbf34adbd2e5a3173699ff0d9
SMS_PROVIDER=semaphore
SMS_FROM_NAME=Sanctuario
```

## Features

### 1. Send Single SMS
**Endpoint**: `POST /api/sms/send`

**Request**:
```json
{
  "phone": "+63912345678",
  "message": "Your message here",
  "reference": "optional_reference_id"
}
```

**Response**:
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "log": { ... },
  "data": { ... }
}
```

### 2. Send Bulk SMS
**Endpoint**: `POST /api/sms/send-bulk`

**Request**:
```json
{
  "phones": ["+63912345678", "+63987654321"],
  "message": "Your message here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "SMS sent to 2 out of 2 recipients",
  "count": 2,
  "successful": 2,
  "results": [ ... ]
}
```

### 3. Send Payment Reminders
**Endpoint**: `POST /api/sms/send-payment-reminders`

Automatically sends SMS reminders to customers with payment plans due soon.

**Query Parameters**:
- `days_until_due` (optional, default: 3) - Number of days before due date to send reminder

**Request**:
```json
{
  "days_until_due": 3
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment reminders sent to 5 out of 5 clients",
  "count": 5,
  "successful": 5,
  "results": [
    {
      "client_id": 1,
      "client_name": "John Doe",
      "phone": "+63912345678",
      "plan_id": 1,
      "amount": 5000,
      "due_date": "May 15, 2026",
      "success": true,
      "message": "SMS sent successfully"
    }
  ]
}
```

### 4. Send Booking Confirmation
**Endpoint**: `POST /api/sms/send-booking-confirmation`

**Request**:
```json
{
  "client_id": 1,
  "booking_id": "BOOK-001",
  "service_type": "Interment Service"
}
```

**Response**:
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "log": { ... }
}
```

### 5. Get SMS Balance
**Endpoint**: `GET /api/sms/balance`

Returns current SMS credits/balance from Semaphore.

**Response**:
```json
{
  "success": true,
  "data": {
    "balance": 1000,
    "currency": "PHP"
  }
}
```

### 6. Get SMS Logs
**Endpoint**: `GET /api/sms/logs`

**Query Parameters**:
- `limit` (optional, default: 50) - Number of logs to retrieve
- `offset` (optional, default: 0) - Pagination offset

**Response**:
```json
{
  "success": true,
  "data": [ ... ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### 7. Get Clients
**Endpoint**: `GET /api/sms/clients`

Returns list of clients with phone numbers for SMS sending.

**Response**:
```json
{
  "success": true,
  "clients": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "+63912345678",
      "email": "john@example.com"
    }
  ],
  "count": 10
}
```

## Phone Number Format

Accepted formats:
- `+63912345678` (with country code)
- `09123456789` (Philippine format)
- `63912345678` (country code without +)

## Message Limits

- **Maximum length**: 160 characters (SMS standard)
- Messages longer than 160 characters are automatically truncated with "..."

## SMS Types

### 1. Payment Reminder
Automatically sent to customers with payment plans due soon.

**Message Format**:
```
Hi [Customer Name], this is a reminder that your payment of ₱[Amount] is due on [Due Date]. Please settle your account. Thank you!
```

### 2. Booking Confirmation
Sent when a booking is confirmed.

**Message Format**:
```
Hi [Customer Name], your booking for [Service Type] (ID: [Booking ID]) has been confirmed. Thank you for choosing Sanctuario!
```

### 3. Service Completion
Sent when a service is completed.

**Message Format**:
```
Hi [Customer Name], your [Service Type] service has been completed. Thank you for using Sanctuario!
```

## Database

### SmsLog Table
Stores all SMS sent through the system.

**Columns**:
- `id` - Log ID
- `phone` - Recipient phone number
- `message` - Message content
- `status` - 'sent' or 'failed'
- `sent_at` - Timestamp when sent
- `reference` - Optional reference ID
- `response` - API response data
- `created_at` - Created timestamp
- `updated_at` - Updated timestamp

## Error Handling

All SMS operations return structured responses:

**Success Response**:
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Failed to send SMS",
  "error": "Error details"
}
```

## Logging

All SMS operations are logged in:
- **Application logs**: `storage/logs/laravel.log`
- **SMS logs**: `sms_logs` table

## Security

- API key is stored in `.env` and not exposed in responses
- Phone numbers are masked in logs for privacy
- All requests require authentication (except public endpoints)

## Automation

### Payment Reminders
To automatically send payment reminders, set up a scheduled task:

```bash
php artisan schedule:run
```

Add to `app/Console/Kernel.php`:
```php
$schedule->post('/api/sms/send-payment-reminders')
    ->daily()
    ->at('09:00');
```

## Testing

### Test SMS Send
```bash
curl -X POST http://localhost:8000/api/sms/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+63912345678",
    "message": "Test message"
  }'
```

### Test Payment Reminders
```bash
curl -X POST http://localhost:8000/api/sms/send-payment-reminders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "days_until_due": 3
  }'
```

### Check Balance
```bash
curl -X GET http://localhost:8000/api/sms/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### SMS Not Sending
1. Check API key in `.env`
2. Verify phone number format
3. Check SMS balance
4. Review logs in `storage/logs/laravel.log`

### Invalid Phone Number
- Ensure phone number includes country code
- Use format: +63912345678 or 09123456789

### API Errors
- Check Semaphore API status
- Verify API key is valid
- Check SMS credits/balance

## Files Created/Modified

### Created
- `app/Services/SmsService.php` - SMS service with Semaphore integration
- `app/Http/Controllers/SmsNotificationController.php` - Alternative SMS controller

### Modified
- `app/Http/Controllers/SmsController.php` - Updated with SMS service integration
- `routes/api.php` - Added new SMS endpoints
- `.env` - Added SMS configuration

## Next Steps

1. Test SMS sending with a test phone number
2. Set up payment reminder automation
3. Integrate SMS notifications into booking workflow
4. Monitor SMS logs and balance
5. Configure SMS templates for different scenarios

---

**Status**: ✅ Integrated  
**Provider**: Semaphore  
**Date**: April 29, 2026
