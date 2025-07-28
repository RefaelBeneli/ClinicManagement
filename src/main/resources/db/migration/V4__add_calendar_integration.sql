-- Migration script to add Google Calendar integration support
-- This adds calendar integration settings and event tracking

-- Create calendar_integrations table
CREATE TABLE calendar_integrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    google_calendar_id VARCHAR(255),
    access_token VARCHAR(1000),
    refresh_token VARCHAR(1000),
    token_expiry TIMESTAMP NULL,
    client_session_calendar VARCHAR(255),
    personal_meeting_calendar VARCHAR(255),
    sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sync_client_sessions BOOLEAN NOT NULL DEFAULT TRUE,
    sync_personal_meetings BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add index for faster user lookups
CREATE INDEX idx_calendar_integrations_user_id ON calendar_integrations(user_id);

-- Add google_event_id to meetings table
ALTER TABLE meetings ADD COLUMN google_event_id VARCHAR(255);

-- Add google_event_id to personal_meetings table
ALTER TABLE personal_meetings ADD COLUMN google_event_id VARCHAR(255);

-- Create indexes for the new columns
CREATE INDEX idx_meetings_google_event ON meetings(google_event_id);
CREATE INDEX idx_personal_meetings_google_event ON personal_meetings(google_event_id); 