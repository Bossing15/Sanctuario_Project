# Maintenance Service Status - Debugging Guide

## Issue Summary
The Status button is not appearing in the admin dashboard for maintenance services, and the ID verification picture is not showing in the View modal.

## How to Debug

### Step 1: Open Browser Developer Console
1. Go to Admin Dashboard
2. Press `F12` or `Ctrl+Shift+I` to open Developer Tools
3. Go to the "Console" tab

### Step 2: Look for Booking Logs
When the dashboard loads, you should see logs like:

```
Enriched bookings: [...]
Booking 123: {
  service_id: 5,
  product_id: null,
  service_name: "Grave Painting",
  service_title: "Grave Painting",
  service_category: "Grave Maintenance",
  service_object: {...},
  status: "Paid",
  authorization_status: "AUTHORIZED",
  full_booking: {...}
}
```

### Step 3: Look for Purchase/Service Logs
When the table renders, you should see logs like:

```
Purchase 123 - Maintenance Check: {
  service_id: 5,
  product_id: null,
  hasServiceId: true,
  service_name: "Grave Painting",
  service_title: "Grave Painting",
  service_category: "Grave Maintenance",
  isMaintenance: true,
  full_service_object: {...}
}
```

OR

```
Service 123 - Maintenance Check: {
  service_id: 5,
  product_id: null,
  hasServiceId: true,
  service_name: "Grave Painting",
  service_title: "Grave Painting",
  service_category: "Grave Maintenance",
  isMaintenance: true,
  full_service_object: {...}
}
```

### Step 4: Check the Values

**If `isMaintenance: true`:**
- The Status button SHOULD appear
- If it doesn't, there's a rendering issue

**If `isMaintenance: false`:**
- Check why the condition failed
- Look at the service_category, service_name, and service_title values
- They should contain "maintenance", "grave", "painting", "cleaning", or "restoration"

**If `hasServiceId: false`:**
- The booking doesn't have a service_id
- It might be a product booking instead
- Check if service_id is null or product_id is set

### Step 5: Check the Service Object

Look at the `full_service_object` in the logs. It should look like:

```javascript
{
  id: 5,
  title: "Grave Painting",
  slug: "grave-painting",
  category: "Grave Maintenance",
  description: "...",
  price_monthly: 800,
  ...
}
```

**If the service object is empty or null:**
- The API is not loading the service relationship
- This is a backend issue

**If the service object exists but category is wrong:**
- The service category in the database might be different
- Check the database directly

### Step 6: Check the ID File Issue

When you click the "View" button, the modal should show the ID file. If it doesn't:

1. Check the modal logs in the console
2. Look for the `reservation` object being passed to the modal
3. Check if `reservation.id_file` exists

**The problem:** The modal is expecting a Reservation object, but it's receiving a Booking object.

**Solution:** The modal needs to be updated to handle Booking objects, not just Reservations.

## Common Issues and Solutions

### Issue 1: Status Button Not Appearing
**Possible Causes:**
1. Service data not loaded from API
2. Service category doesn't match "Grave Maintenance"
3. Service name doesn't contain maintenance keywords
4. Booking doesn't have service_id set

**Solution:**
- Check console logs for `isMaintenance` value
- If false, check service_category, service_name, service_title
- If service object is null, check API response

### Issue 2: ID File Not Showing
**Possible Causes:**
1. Modal is showing Booking instead of Reservation
2. Booking doesn't have id_file field
3. ID file wasn't uploaded during reservation

**Solution:**
- The modal needs to be updated to show booking.id_file instead of reservation.id_file
- Or create a separate modal for Booking details

### Issue 3: Service Data is Null
**Possible Causes:**
1. API not loading service relationship
2. Service ID doesn't exist in database
3. Service was deleted

**Solution:**
- Check the API response in Network tab
- Verify service exists in database
- Check if service_id is correct

## Network Tab Debugging

1. Open Developer Tools → Network tab
2. Reload the dashboard
3. Look for the `/api/bookings` request
4. Click on it and check the Response
5. Look for the booking with your maintenance service
6. Check if the `service` object is included in the response

**Expected Response:**
```json
{
  "bookings": [
    {
      "id": 123,
      "service_id": 5,
      "product_id": null,
      "status": "Paid",
      "authorization_status": "AUTHORIZED",
      "service": {
        "id": 5,
        "title": "Grave Painting",
        "category": "Grave Maintenance",
        ...
      },
      ...
    }
  ]
}
```

## What to Report

If the Status button still doesn't appear, please provide:

1. **Console logs** showing the Booking data
2. **Network response** from `/api/bookings` API
3. **Service details** from the logs (category, title, name)
4. **Booking details** (service_id, product_id, authorization_status)
5. **Screenshot** of the dashboard table

## Quick Checklist

- [ ] Opened browser console (F12)
- [ ] Saw "Enriched bookings" log
- [ ] Saw "Purchase/Service" maintenance check log
- [ ] Checked if `isMaintenance: true`
- [ ] Checked if `hasServiceId: true`
- [ ] Checked service_category value
- [ ] Checked service_title value
- [ ] Checked Network tab for API response
- [ ] Verified service object exists in response

## Next Steps

Once you've gathered this information:

1. **If `isMaintenance: true` but button doesn't show:**
   - There's a rendering issue in the JSX
   - Need to check the conditional rendering code

2. **If `isMaintenance: false`:**
   - The service data doesn't match the detection criteria
   - Need to update the detection logic or fix the service data

3. **If service object is null:**
   - The API isn't loading the service relationship
   - Need to fix the backend API

4. **If ID file not showing:**
   - Need to update the modal to handle Booking objects
   - Or create a separate modal for bookings

## Contact

Please share the console logs and network response so I can help debug further.
