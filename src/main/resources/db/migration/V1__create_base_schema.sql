-- V1 Migration: Create base schema with all core tables
-- This migration establishes the foundation schema for the clinic management system

-- Create users table with approval system
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('USER', 'ADMIN')),
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    approval_status VARCHAR(255) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by BIGINT,
    approved_date TIMESTAMP,
    rejection_reason VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create clients table
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    date_of_birth VARCHAR(255),
    notes VARCHAR(1000),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create meetings table (client sessions)
CREATE TABLE meetings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    meeting_date TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    notes VARCHAR(1000),
    status VARCHAR(255) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Create personal_meetings table (therapist's own sessions)
CREATE TABLE personal_meetings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    therapist_name VARCHAR(255) NOT NULL,
    meeting_date TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    notes VARCHAR(1000),
    status VARCHAR(255) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_client_id ON meetings(client_id);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_personal_meetings_user_id ON personal_meetings(user_id);
CREATE INDEX idx_personal_meetings_date ON personal_meetings(meeting_date); 