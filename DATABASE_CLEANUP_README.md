# Database Cleanup Instructions

## Problem
The application is failing to start due to a failed Flyway migration. The error shows:
```
Detected failed migration to version 1 (create base schema).
Please remove any half-completed changes then run repair to fix the schema history.
```

## Solution
Since you want to drop and recreate the tables, we need to clean up the database and reset Flyway state.

## Steps to Clean Up

### Option 1: Using the provided script
1. Run the cleanup script:
   ```bash
   ./cleanup_database.sh
   ```

### Option 2: Manual cleanup
If you don't have MySQL client locally, run this in your database:

```sql
-- Drop all tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS calendar_integrations;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS personal_meetings;
DROP TABLE IF EXISTS meetings;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS client_sources;
DROP TABLE IF EXISTS personal_meeting_types;
DROP TABLE IF EXISTS expense_categories;
DROP TABLE IF EXISTS payment_types;
DROP TABLE IF EXISTS users;

-- Drop Flyway schema history table
DROP TABLE IF EXISTS flyway_schema_history;
```

## After Cleanup

1. **Re-enable Flyway** in `src/main/resources/application.yml`:
   ```yaml
   flyway:
     enabled: true
   ```

2. **Reset JPA DDL auto** in `src/main/resources/application.yml`:
   ```yaml
   jpa:
     hibernate:
       ddl-auto: none
   ```

3. **Restart the application**:
   ```bash
   ./gradlew bootRun
   ```

## What This Will Do

- **Clean slate**: All old tables and data will be removed
- **Fresh migration**: Flyway will run the migration from scratch
- **New payment system**: The new comprehensive payment tracking system will be created
- **Proper indexes**: All tables will have the correct structure and indexes

## Expected Result

After cleanup and restart, you should see:
- Application starts successfully
- All tables created with new payment system
- No more migration errors
- Ready for development and testing

## Note

⚠️ **WARNING**: This will delete ALL data in the database. Make sure you have backups if you need to preserve any existing data.
