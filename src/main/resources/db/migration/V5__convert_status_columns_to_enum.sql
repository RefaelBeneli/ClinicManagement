-- Convert VARCHAR status columns to ENUM to align with Hibernate expectations

-- Meetings table
ALTER TABLE meetings 
    MODIFY COLUMN status ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL;

-- Personal meetings table
ALTER TABLE personal_meetings 
    MODIFY COLUMN status ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL; 