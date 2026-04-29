# Cache Table Fix - Password Reset Feature

## Problem
When attempting to use the forgot password feature, the system returned an error:
```
SQLSTATE[42S02]: Base table or view not found: 1146 Table 'sanctuario.cache' doesn't exist
```

## Root Cause
The `cache` table migration existed but was never actually created in the database. This table is required by Laravel to store temporary data like password reset tokens.

## Solution
Created and ran a new migration file: `2026_04_29_create_cache_table_fix.php`

This migration:
1. Creates the `cache` table with proper structure:
   - `key` (VARCHAR 255, PRIMARY KEY) - stores the cache key
   - `value` (MEDIUMTEXT) - stores the cached data
   - `expiration` (INT) - stores the expiration timestamp

2. Creates the `cache_locks` table for cache locking:
   - `key` (VARCHAR 255, PRIMARY KEY)
   - `owner` (VARCHAR 255)
   - `expiration` (INT)

## What This Fixes
- ✅ Password reset tokens can now be stored
- ✅ Forgot password feature now works
- ✅ Email reset links are properly cached
- ✅ Token expiration (1 hour) is properly tracked

## How to Test
1. Go to login page
2. Click "Forgot your password?"
3. Enter your email address
4. Click "Send Reset Link"
5. Check your email for the reset link
6. Click the link and reset your password

## Technical Details

### Cache Table Structure
```sql
CREATE TABLE cache (
    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
    value MEDIUMTEXT NOT NULL,
    expiration INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

### Cache Locks Table Structure
```sql
CREATE TABLE cache_locks (
    `key` VARCHAR(255) NOT NULL PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

## Migration File
Location: `database/migrations/2026_04_29_create_cache_table_fix.php`

The migration was run successfully on 2026-04-29.

## Future Prevention
To prevent this issue in the future:
1. Always run `php artisan migrate` after pulling new code
2. Check migration status with `php artisan migrate:status`
3. Ensure all migrations show as "Ran"

## Related Features
This cache table is also used by:
- Password reset tokens (forgot password)
- Session caching
- Query result caching
- Any other Laravel cache operations

## Support
If you encounter similar issues:
1. Run `php artisan migrate:status` to check migration status
2. Run `php artisan migrate` to run pending migrations
3. Check Laravel logs for detailed error messages
