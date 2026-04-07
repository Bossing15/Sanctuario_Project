# Database Schema

This directory contains the database schema (structure only, no data) for the Sanctuario application.

## Files

- `sanctuario_db_schema.sql` - Complete database structure export

## How to Use

### Option 1: Using Laravel Migrations (Recommended)
```bash
# Run all migrations to create the database structure
php artisan migrate

# If you need to reset and rebuild
php artisan migrate:fresh
```

### Option 2: Import SQL Schema Directly
```bash
# Create the database first
mysql -u root -p -e "CREATE DATABASE sanctuario_db;"

# Import the schema
mysql -u root -p sanctuario_db < database/schema/sanctuario_db_schema.sql
```

## Database Configuration

Make sure your `.env` file has the correct database settings:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sanctuario_db
DB_USERNAME=root
DB_PASSWORD=
```

## Notes

- This schema file contains only the table structures, not the data
- The schema is automatically generated from the current database
- Always use migrations for version control of database changes
