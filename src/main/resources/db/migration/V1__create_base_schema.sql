-- V1 Migration: Create base schema with all core tables
-- This migration establishes the foundation schema for the clinic management system

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT NULL,
    approved_date TIMESTAMP NULL,
    rejection_reason VARCHAR(1000) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Create payment_types table
CREATE TABLE payment_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create expense_categories table
CREATE TABLE expense_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create client_sources table
CREATE TABLE client_sources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    duration INT NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    no_show_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    default_sessions INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    notes TEXT,
    source_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (source_id) REFERENCES client_sources(id)
);

-- Create meetings table
CREATE TABLE meetings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    meeting_date DATETIME NOT NULL,
    duration INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date DATETIME,
    payment_type_id BIGINT,
    notes TEXT,
    summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    google_event_id VARCHAR(255),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_frequency VARCHAR(50),
    total_sessions INT,
    session_number INT NOT NULL DEFAULT 1,
    parent_meeting_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (payment_type_id) REFERENCES payment_types(id),
    FOREIGN KEY (parent_meeting_id) REFERENCES meetings(id)
);

-- Create personal_meeting_types table
CREATE TABLE personal_meeting_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    duration INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_frequency VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create personal_meetings table
CREATE TABLE personal_meetings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    therapist_name VARCHAR(255) NOT NULL,
    meeting_type_id BIGINT,
    provider_type VARCHAR(100),
    provider_credentials TEXT,
    meeting_date DATETIME NOT NULL,
    duration INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date DATETIME,
    notes TEXT,
    summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    google_event_id VARCHAR(255),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_frequency VARCHAR(50),
    next_due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (meeting_type_id) REFERENCES personal_meeting_types(id)
);

-- Create expenses table
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ILS',
    category_id BIGINT NOT NULL,
    notes TEXT,
    expense_date DATE NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_frequency VARCHAR(50),
    recurrence_count INT,
    next_due_date DATE,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_type_id BIGINT,
    receipt_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (payment_type_id) REFERENCES payment_types(id)
);

-- Create calendar_integrations table
CREATE TABLE calendar_integrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    google_calendar_id VARCHAR(255),
    client_session_calendar VARCHAR(255),
    personal_meeting_calendar VARCHAR(255),
    sync_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    sync_client_sessions BOOLEAN NOT NULL DEFAULT FALSE,
    sync_personal_meetings BOOLEAN NOT NULL DEFAULT FALSE,
    last_sync_date DATETIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default payment types
INSERT INTO payment_types (name) VALUES 
('Cash'),
('Bank Transfer'),
('Credit Card'),
('Check'),
('Other');

-- Insert default expense categories
INSERT INTO expense_categories (name, description) VALUES
('Office Supplies', 'Office supplies and stationery'),
('Rent', 'Office rent and utilities'),
('Equipment', 'Office equipment and furniture'),
('Marketing', 'Marketing and advertising expenses'),
('Travel', 'Travel and transportation expenses'),
('Insurance', 'Business insurance premiums'),
('Software', 'Software licenses and subscriptions'),
('Professional Services', 'Legal, accounting, and consulting fees'),
('Maintenance', 'Office maintenance and repairs'),
('Other', 'Miscellaneous expenses');

-- Insert default client sources
INSERT INTO client_sources (name, duration, price, no_show_price, default_sessions) VALUES
('Private', 60, 200.00, 100.00, 1),
('Natal', 45, 150.00, 75.00, 1),
('Clalit', 50, 120.00, 60.00, 1);

-- Insert default personal meeting types
INSERT INTO personal_meeting_types (name, duration, price, is_recurring, recurrence_frequency) VALUES
('Personal Therapy', 60, 300.00, FALSE, NULL),
('Professional Development', 90, 400.00, FALSE, NULL),
('Supervision', 60, 250.00, FALSE, NULL),
('Teaching Session', 120, 500.00, FALSE, NULL);

-- Insert default admin user
INSERT INTO users (username, password, email, full_name, role, enabled, approval_status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'admin@clinic.com', 'Administrator', 'ADMIN', TRUE, 'APPROVED');

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_users_approved_by ON users(approved_by);
CREATE INDEX idx_client_sources_active ON client_sources(is_active);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_source_id ON clients(source_id);
CREATE INDEX idx_payment_types_active ON payment_types(is_active);
CREATE INDEX idx_personal_meeting_types_active ON personal_meeting_types(is_active);
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_payment_type_id ON meetings(payment_type_id);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_personal_meetings_user_id ON personal_meetings(user_id);
CREATE INDEX idx_personal_meetings_meeting_type_id ON personal_meetings(meeting_type_id);
CREATE INDEX idx_personal_meetings_date ON personal_meetings(meeting_date);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_calendar_integration_user_id ON calendar_integrations(user_id);

-- Update existing clients to have is_active field set
-- This ensures all existing clients have the is_active field properly set
UPDATE clients 
SET is_active = TRUE 
WHERE is_active IS NULL; 