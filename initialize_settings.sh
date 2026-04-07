#!/bin/bash

# Initialize default settings for Sanctuario Admin Panel
# This script calls the API endpoint to populate default settings

echo "Initializing default site settings..."

# Get auth token (you'll need to replace this with actual admin token)
# For now, we'll use curl to call the endpoint

curl -X POST http://127.0.0.1:8000/api/admin/site-settings/initialize-defaults \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"

echo ""
echo "Settings initialization complete!"
echo "You can now access the Settings panel in the admin dashboard."
