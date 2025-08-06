-- V3 Migration: Add missing fields to match entity definitions
-- This migration adds fields that the JPA entities expect but are missing from the database schema

-- Add missing fields to client_sources table
ALTER TABLE client_sources 
ADD COLUMN duration INT NOT NULL DEFAULT 60,
ADD COLUMN no_show_price DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Add missing fields to meetings table
ALTER TABLE meetings 
ADD COLUMN google_event_id VARCHAR(255) NULL;

-- Add missing fields to personal_meetings table
ALTER TABLE personal_meetings 
ADD COLUMN google_event_id VARCHAR(255) NULL;

-- Update existing client_sources with appropriate no_show_price values
UPDATE client_sources 
SET no_show_price = price * 0.5 
WHERE no_show_price = 0.00; 