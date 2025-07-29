-- Convert approval_status column to ENUM to match Hibernate

ALTER TABLE users 
    MODIFY COLUMN approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL; 