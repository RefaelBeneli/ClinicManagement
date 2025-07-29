-- Migration script to add meeting type and provider information to personal_meetings table
-- This adds support for distinguishing between therapy, professional development, supervision, and teaching sessions

-- Add the new columns
ALTER TABLE personal_meetings
  ADD COLUMN meeting_type ENUM('PERSONAL_THERAPY','PROFESSIONAL_DEVELOPMENT','SUPERVISION','TEACHING_SESSION')
    NOT NULL DEFAULT 'PERSONAL_THERAPY';
ALTER TABLE personal_meetings ADD COLUMN provider_type VARCHAR(50) DEFAULT 'Therapist';
ALTER TABLE personal_meetings ADD COLUMN provider_credentials VARCHAR(255); 