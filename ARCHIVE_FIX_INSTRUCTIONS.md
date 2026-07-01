# Archive Functionality Fix - Step by Step

## The Problem
The 500 error occurs because the database columns `archived` and `archived_at` don't exist in the `clients` table yet.

## Solution: Run the Migration

### Step 1: Navigate to Project Root
```bash
cd Sanctuario_Project
```

### Step 2: Run the Migration
```bash
php artisan migrate
```

This will execute the migration file and add the necessary columns to the clients table:
- `archived` (boolean, default: false)
- `archived_at` (timestamp, nullable)

### Step 3: Clear Cache
```bash
php artisan cache:clear
```

### Step 4: Build the Frontend
```bash
cd resources
npm run build
cd ../client-app
npm run build
cd ..
```

### Step 5: Test the Archive Functionality
1. Go to Admin Dashboard → Customers
2. Click Archive on any customer
3. Click "Yes" in the modal
4. Customer should be archived successfully

---

## If Migration Fails

### Check Database Connection
Make sure your `.env` file has correct database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sanctuario
DB_USERNAME=root
DB_PASSWORD=
```

### Check Migration Status
```bash
php artisan migrate:status
```

### Rollback and Re-run
If migration has issues:
```bash
php artisan migrate:rollback
php artisan migrate
```

---

## What the Migration Does

**Before:**
```
clients table columns: id, name, email, password, username, etc.
```

**After:**
```
clients table columns: id, name, email, password, username, ..., archived, archived_at
```

### The Migration File Location
- File: `database/migrations/2026_05_12_add_archived_to_clients_table.php`
- This file has been updated to safely check if columns exist before adding them

---

## Verify the Fix Worked

### In MySQL Command Line:
```sql
USE sanctuario;
DESCRIBE clients;
```

You should see:
- `archived` column (TINYINT, default 0)
- `archived_at` column (TIMESTAMP, nullable)

### Or Using Laravel Tinker:
```bash
php artisan tinker
```

```php
>>> Schema::hasColumn('clients', 'archived')
=> true
>>> Schema::hasColumn('clients', 'archived_at')
=> true
```

---

## After Running Migration

The archive functionality will work as expected:
- ✅ Archive button will work
- ✅ Archived customers will be hidden from active list
- ✅ Can view archived customers by clicking toggle
- ✅ Archived customers cannot login to client-app

---

## Quick Command Reference

```bash
# Navigate to project
cd Sanctuario_Project

# Run migration
php artisan migrate

# Clear cache
php artisan cache:clear

# Build frontend
cd resources && npm run build && cd ../client-app && npm run build && cd ..

# Check migration status
php artisan migrate:status

# Rollback if needed
php artisan migrate:rollback
```

---

## Common Issues and Solutions

### Issue: "Column already exists"
**Solution**: The migration is idempotent - it checks if columns exist before adding them. Just run migrate again.

### Issue: "Unknown database"
**Solution**: Create the database first:
```bash
php artisan migrate:fresh
```

### Issue: "SQLSTATE[HY000]: General error"
**Solution**: Clear cache and try again:
```bash
php artisan cache:clear
php artisan config:clear
php artisan migrate
```

---

**Status**: Ready to migrate
**Files Updated**: 
- Migration file created with safety checks
- AuthController updated with 'sometimes' validation
- Client model updated with fields
- Customers component ready

Next Step: Run `php artisan migrate` to add the database columns
