-- V2 Migration: Add expense payment support
-- This migration adds support for tracking expense payments in the payments table

-- Add EXPENSE to the session_type enum in payments table
ALTER TABLE payments MODIFY COLUMN session_type ENUM('MEETING', 'PERSONAL_MEETING', 'EXPENSE') NOT NULL;

-- Add missing payment-related fields to expenses table if they don't exist
-- Note: Some fields might already exist from V1, so we use IF NOT EXISTS pattern

-- Add payment_type_id to expenses table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'expenses' 
     AND COLUMN_NAME = 'payment_type_id') = 0,
    'ALTER TABLE expenses ADD COLUMN payment_type_id BIGINT NULL',
    'SELECT "payment_type_id column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_paid to expenses table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'expenses' 
     AND COLUMN_NAME = 'is_paid') = 0,
    'ALTER TABLE expenses ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT FALSE',
    'SELECT "is_paid column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_date to expenses table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'expenses' 
     AND COLUMN_NAME = 'payment_date') = 0,
    'ALTER TABLE expenses ADD COLUMN payment_date DATETIME NULL',
    'SELECT "payment_date column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add reference_number to expenses table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'expenses' 
     AND COLUMN_NAME = 'reference_number') = 0,
    'ALTER TABLE expenses ADD COLUMN reference_number VARCHAR(255) NULL',
    'SELECT "reference_number column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add transaction_id to expenses table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'expenses' 
     AND COLUMN_NAME = 'transaction_id') = 0,
    'ALTER TABLE expenses ADD COLUMN transaction_id VARCHAR(255) NULL',
    'SELECT "transaction_id column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for payment_type_id if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'expenses' 
     AND COLUMN_NAME = 'payment_type_id' 
     AND CONSTRAINT_NAME LIKE '%fk_expense_payment_type%') = 0,
    'ALTER TABLE expenses ADD CONSTRAINT fk_expense_payment_type FOREIGN KEY (payment_type_id) REFERENCES payment_types(id)',
    'SELECT "payment_type_id foreign key already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index on session_type and session_id for better performance
-- Note: MySQL doesn't support IF NOT EXISTS for CREATE INDEX, so we'll create them directly
CREATE INDEX idx_payments_session_type_id ON payments(session_type, session_id);

-- Create index on expenses payment fields for better performance
CREATE INDEX idx_expenses_payment_status ON expenses(is_paid, payment_date);
CREATE INDEX idx_expenses_payment_type ON expenses(payment_type_id);
