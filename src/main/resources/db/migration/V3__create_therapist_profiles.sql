-- Migration script to create therapist_profiles table
-- This adds support for enhanced therapist information and multi-therapist clinic functionality

CREATE TABLE therapist_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    specialization VARCHAR(255),
    default_rate DECIMAL(10,2),
    default_session_duration INT NOT NULL DEFAULT 60,
    available_hours TEXT,
    bio TEXT,
    license_number VARCHAR(255),
    years_experience INT,
    education TEXT,
    certifications TEXT,
    languages VARCHAR(255),
    is_accepting_new_clients BOOLEAN NOT NULL DEFAULT TRUE,
    profile_image_url VARCHAR(500),
    phone_number VARCHAR(50),
    office_location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX idx_therapist_profiles_user_id ON therapist_profiles(user_id);
CREATE INDEX idx_therapist_profiles_accepting_clients ON therapist_profiles(is_accepting_new_clients);
CREATE INDEX idx_therapist_profiles_specialization ON therapist_profiles(specialization);

-- Add constraint to ensure session duration is at least 15 minutes
ALTER TABLE therapist_profiles ADD CONSTRAINT check_session_duration 
  CHECK (default_session_duration >= 15); 