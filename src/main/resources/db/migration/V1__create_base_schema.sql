-- V1 Migration: Create base schema with all core tables
-- This migration establishes the foundation schema for the clinic management system

-- Create users table with approval system
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER','ADMIN') NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT,
    approved_date TIMESTAMP NULL,
    rejection_reason VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create clients table
CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    notes VARCHAR(1000),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create meeting_sources table
CREATE TABLE meeting_sources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    duration INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    no_show_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create payment_types table
CREATE TABLE payment_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create personal_meeting_types table
CREATE TABLE personal_meeting_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    duration INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_frequency VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create meetings table (client sessions)
CREATE TABLE meetings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    source_id BIGINT NOT NULL,
    payment_type_id BIGINT NULL,
    meeting_date TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    notes VARCHAR(1000),
    summary TEXT,
    status ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date TIMESTAMP NULL,
    google_event_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES meeting_sources(id),
    FOREIGN KEY (payment_type_id) REFERENCES payment_types(id)
);

-- Create personal_meetings table (therapist's own sessions)
CREATE TABLE personal_meetings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    therapist_name VARCHAR(255) NOT NULL,
    meeting_type_id BIGINT NOT NULL,
    provider_type VARCHAR(100) NOT NULL DEFAULT 'Therapist',
    provider_credentials VARCHAR(255),
    meeting_date TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    notes VARCHAR(1000),
    summary TEXT,
    status ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date TIMESTAMP NULL,
    google_event_id VARCHAR(255),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_frequency VARCHAR(50),
    next_due_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_type_id) REFERENCES personal_meeting_types(id)
);

-- Create expenses table
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'ILS',
    category VARCHAR(100) NOT NULL,
    notes VARCHAR(1000),
    expense_date DATE NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_frequency VARCHAR(50),
    next_due_date DATE,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method VARCHAR(100),
    receipt_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create calendar_integration table
CREATE TABLE calendar_integration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    google_calendar_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default meeting sources
INSERT INTO meeting_sources (name, duration, price, no_show_price) VALUES
('Private', 60, 350.00, 350.00),
('Natal', 60, 300.00, 150.00),
('Clalit', 60, 280.00, 280.00);

-- Insert default payment types
INSERT INTO payment_types (name) VALUES
('Bank Transfer'),
('Bit'),
('Paybox'),
('Cash');

-- Insert default personal meeting types
INSERT INTO personal_meeting_types (name, duration, price, is_recurring, recurrence_frequency) VALUES
('Personal Therapy', 60, 400.00, false, null),
('Professional Development', 90, 500.00, true, 'monthly'),
('Supervision', 60, 350.00, true, 'weekly'),
('Teaching Session', 120, 600.00, false, null);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_meeting_sources_active ON meeting_sources(is_active);
CREATE INDEX idx_payment_types_active ON payment_types(is_active);
CREATE INDEX idx_personal_meeting_types_active ON personal_meeting_types(is_active);
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_source_id ON meetings(source_id);
CREATE INDEX idx_meetings_payment_type_id ON meetings(payment_type_id);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_personal_meetings_user_id ON personal_meetings(user_id);
CREATE INDEX idx_personal_meetings_meeting_type_id ON personal_meetings(meeting_type_id);
CREATE INDEX idx_personal_meetings_date ON personal_meetings(meeting_date);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_calendar_integration_user_id ON calendar_integration(user_id);

-- Update existing clients to have is_active field set
-- This ensures all existing clients have the is_active field properly set
UPDATE clients 
SET is_active = TRUE 
WHERE is_active IS NULL; 