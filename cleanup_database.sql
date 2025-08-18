-- Database cleanup script for Clinic Management System
-- Run this script to reset the database and start fresh

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

-- Reset auto-increment counters (optional, but good practice)
-- Note: MySQL will automatically reset these when tables are recreated
