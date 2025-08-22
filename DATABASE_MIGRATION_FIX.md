# Database Migration Fix for Recurring Personal Meetings

## Problem Description
The backend was failing to start with the error:
```
Schema-validation: missing column [parent_meeting_id] in table [personal_meetings]
```

## Root Cause
When we added new fields to the `PersonalMeeting` entity to support recurring sessions, the database schema wasn't updated to match. Hibernate's schema validation was failing because it expected these columns to exist.

## New Fields Added
The following fields were added to the `PersonalMeeting` entity:

1. **`totalSessions`** - Total number of sessions in the recurring series
2. **`sessionNumber`** - Which session number this is (1, 2, 3, etc.)
3. **`parentMeetingId`** - Link to the parent recurring session

## Solution: Database Migration

### **Migration File Status**
✅ **CONSOLIDATED** - All fields are now included in `V1__consolidated_schema.sql`

The recurring personal meeting fields have been consolidated into the main schema migration:
- `total_sessions` - Total number of sessions in the recurring series
- `session_number` - Which session number this is (1, 2, 3, etc.)  
- `parent_meeting_id` - Link to the parent recurring session

### **Migration Contents (Consolidated)**
```sql
-- These fields are now part of the main personal_meetings table creation
total_sessions INT NULL COMMENT 'Total number of sessions in the recurring series',
session_number INT NULL COMMENT 'Which session number this is (1, 2, 3, etc.)',
parent_meeting_id BIGINT NULL COMMENT 'Link to the parent recurring session';

-- Index and foreign key constraints are also included
CREATE INDEX idx_personal_meetings_parent_id ON personal_meetings(parent_meeting_id);
FOREIGN KEY (parent_meeting_id) REFERENCES personal_meetings(id) ON DELETE SET NULL;
```

## What the Migration Does

### 1. **Adds New Columns**
- `total_sessions` - Integer field for session count
- `session_number` - Integer field for session numbering
- `parent_meeting_id` - BigInt field for parent-child relationships

### 2. **Creates Index**
- Adds index on `parent_meeting_id` for better query performance
- Essential for recurring session lookups

### 3. **Adds Foreign Key Constraint**
- Ensures `parent_meeting_id` references valid meeting IDs
- Maintains referential integrity
- Uses `ON DELETE SET NULL` for flexible deletion

### 4. **Updates Existing Data**
- Sets default values for existing recurring meetings
- Ensures backward compatibility

## How to Apply the Migration

### **Option 1: Automatic (Recommended)**
1. Restart the backend application
2. Flyway will automatically detect and run the new migration
3. The application should start successfully

### **Option 2: Manual Database Update**
If you prefer to run the migration manually:
```bash
# Connect to your MySQL database
mysql -u username -p database_name

# The migration is already applied via V1__consolidated_schema.sql
# No manual action needed
```

## Verification Steps

### 1. **Check Migration Status**
After the backend starts, check the Flyway migration table:
```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;
```

You should see `V1__consolidated_schema.sql` in the list (the only migration file).

### 2. **Verify New Columns**
Check that the new columns exist:
```sql
DESCRIBE personal_meetings;
```

You should see:
- `total_sessions`
- `session_number` 
- `parent_meeting_id`

### 3. **Test Recurring Personal Meetings**
1. Create a recurring personal meeting
2. Verify that multiple sessions are created
3. Check that the new fields are populated correctly

## Expected Results

### **Before Migration**
- Backend fails to start
- Schema validation error
- Missing columns in database

### **After Migration**
- Backend starts successfully
- New columns available in database
- Recurring personal meetings work correctly
- All sessions properly linked via `parent_meeting_id`

## Troubleshooting

### **If Migration Fails**
1. Check MySQL error logs for specific issues
2. Verify database user has ALTER TABLE permissions
3. Ensure no conflicting constraints exist

### **If Backend Still Won't Start**
1. Check that migration V3 was applied successfully
2. Verify all columns exist in the database
3. Check Hibernate logs for validation errors

### **Data Integrity Issues**
1. Verify foreign key constraints are working
2. Check that existing data was updated correctly
3. Ensure no orphaned `parent_meeting_id` references

## Rollback Plan

If you need to rollback the migration:
```sql
-- Remove foreign key constraint
ALTER TABLE personal_meetings DROP FOREIGN KEY fk_personal_meetings_parent;

-- Remove index
DROP INDEX idx_personal_meetings_parent_id ON personal_meetings;

-- Remove columns
ALTER TABLE personal_meetings 
DROP COLUMN total_sessions,
DROP COLUMN session_number,
DROP COLUMN parent_meeting_id;
```

## Summary

The database migration `V1__consolidated_schema.sql` resolves the schema validation error by:

- ✅ **Adding Missing Columns**: All required fields for recurring sessions
- ✅ **Creating Indexes**: Performance optimization for queries
- ✅ **Adding Constraints**: Data integrity and referential integrity
- ✅ **Updating Existing Data**: Backward compatibility
- ✅ **Enabling Recurring Logic**: Full recurring personal meeting functionality

After applying this migration, the backend should start successfully and recurring personal meetings should work as expected! 🎉

