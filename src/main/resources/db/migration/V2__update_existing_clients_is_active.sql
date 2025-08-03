-- V2 Migration: Update existing clients to have is_active field set
-- This migration ensures all existing clients have the is_active field properly set

UPDATE clients 
SET is_active = TRUE 
WHERE is_active IS NULL; 