-- Convert meeting_type column to ENUM to satisfy Hibernate validation

ALTER TABLE personal_meetings 
    MODIFY COLUMN meeting_type ENUM('PERSONAL_THERAPY','PROFESSIONAL_DEVELOPMENT','SUPERVISION','TEACHING_SESSION') NOT NULL; 