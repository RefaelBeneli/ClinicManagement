-- Migration script to add meeting type and provider information to personal_meetings table
-- This adds support for distinguishing between therapy, professional development, supervision, and teaching sessions

-- Add the new columns
ALTER TABLE personal_meetings ADD COLUMN meeting_type VARCHAR(50) DEFAULT 'PERSONAL_THERAPY';
ALTER TABLE personal_meetings ADD COLUMN provider_type VARCHAR(50) DEFAULT 'Therapist';
ALTER TABLE personal_meetings ADD COLUMN provider_credentials VARCHAR(255);

-- Add constraints to ensure valid enum values
ALTER TABLE personal_meetings ADD CONSTRAINT check_meeting_type 
  CHECK (meeting_type IN ('PERSONAL_THERAPY', 'PROFESSIONAL_DEVELOPMENT', 'SUPERVISION', 'TEACHING_SESSION'));

-- Update NOT NULL constraints after setting defaults
ALTER TABLE personal_meetings ALTER COLUMN meeting_type SET NOT NULL;
ALTER TABLE personal_meetings ALTER COLUMN provider_type SET NOT NULL; 