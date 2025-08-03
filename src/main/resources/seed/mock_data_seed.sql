-- Seed data for ClinicManagement – run manually (NOT a Flyway migration)
-- -----------------------------------------------------------------------

-- 1. Multiple Therapist users for testing different scenarios
INSERT INTO users (username, email, full_name, password,
                   role, enabled, approval_status, created_at)
VALUES 
('therapist1', 'therapist1@clinic.com', 'Dr. Sarah Cohen', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 365 DAY),

('therapist2', 'therapist2@clinic.com', 'Dr. David Levy', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 180 DAY),

('therapist3', 'therapist3@clinic.com', 'Dr. Rachel Green', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 90 DAY),

('admin1', 'admin@clinic.com', 'Admin Manager', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'ADMIN', TRUE, 'APPROVED', NOW() - INTERVAL 500 DAY);

SET @therapist1_id := (SELECT id FROM users WHERE username = 'therapist1');
SET @therapist2_id := (SELECT id FROM users WHERE username = 'therapist2');
SET @therapist3_id := (SELECT id FROM users WHERE username = 'therapist3');
SET @admin_id := (SELECT id FROM users WHERE username = 'admin1');

-- 3. Diverse Clients for each therapist
-- Therapist 1 Clients
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist1_id, 'Avi Rosenberg', 'avi.rosenberg@email.com', '050-123-4567', 'Prefers evening sessions, anxiety focus', TRUE, NOW() - INTERVAL 300 DAY),
(@therapist1_id, 'Maya Cohen', 'maya.cohen@email.com', '052-234-5678', 'Couples therapy, communication issues', TRUE, NOW() - INTERVAL 250 DAY),
(@therapist1_id, 'Yossi Levy', 'yossi.levy@email.com', '053-345-6789', 'Depression treatment, medication management', TRUE, NOW() - INTERVAL 200 DAY),
(@therapist1_id, 'Rina Green', 'rina.green@email.com', '054-456-7890', 'Trauma therapy, EMDR specialist', TRUE, NOW() - INTERVAL 150 DAY),
(@therapist1_id, 'Dani Brown', 'dani.brown@email.com', '055-567-8901', 'ADHD coaching, organizational skills', TRUE, NOW() - INTERVAL 100 DAY);

-- Therapist 2 Clients
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist2_id, 'Sara Goldstein', 'sara.goldstein@email.com', '050-678-9012', 'Eating disorder recovery', TRUE, NOW() - INTERVAL 280 DAY),
(@therapist2_id, 'Tom Friedman', 'tom.friedman@email.com', '052-789-0123', 'Substance abuse counseling', TRUE, NOW() - INTERVAL 220 DAY),
(@therapist2_id, 'Liora Schwartz', 'liora.schwartz@email.com', '053-890-1234', 'Grief counseling, loss of spouse', TRUE, NOW() - INTERVAL 180 DAY),
(@therapist2_id, 'Amir Hassan', 'amir.hassan@email.com', '054-901-2345', 'Cultural adjustment, immigrant support', TRUE, NOW() - INTERVAL 120 DAY);

-- Therapist 3 Clients
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist3_id, 'Ella Johnson', 'ella.johnson@email.com', '050-012-3456', 'Teen therapy, school anxiety', TRUE, NOW() - INTERVAL 90 DAY),
(@therapist3_id, 'Rafi Stern', 'rafi.stern@email.com', '052-123-4567', 'Work stress, burnout prevention', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist3_id, 'Nina Patel', 'nina.patel@email.com', '053-234-5678', 'Pregnancy counseling, postpartum support', TRUE, NOW() - INTERVAL 45 DAY);

-- Set client IDs for reference
SET @client1_id := (SELECT id FROM clients WHERE user_id = @therapist1_id LIMIT 1);
SET @client2_id := (SELECT id FROM clients WHERE user_id = @therapist1_id LIMIT 1 OFFSET 1);
SET @client3_id := (SELECT id FROM clients WHERE user_id = @therapist2_id LIMIT 1);
SET @client4_id := (SELECT id FROM clients WHERE user_id = @therapist2_id LIMIT 1 OFFSET 1);
SET @client5_id := (SELECT id FROM clients WHERE user_id = @therapist3_id LIMIT 1);

-- 4. Diverse Meetings across all therapists
-- Therapist 1 - Avi Rosenberg (Anxiety focus)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist1_id, @client1_id, NOW() - INTERVAL 7 DAY, 60, 150.00, 'Anxiety management techniques, breathing exercises', 'COMPLETED', TRUE, NOW() - INTERVAL 7 DAY, TRUE, NOW() - INTERVAL 7 DAY),
(@therapist1_id, @client1_id, NOW() - INTERVAL 14 DAY, 90, 200.00, 'Exposure therapy session, panic attack prevention', 'COMPLETED', TRUE, NOW() - INTERVAL 14 DAY, TRUE, NOW() - INTERVAL 14 DAY),
(@therapist1_id, @client1_id, NOW() + INTERVAL 3 DAY, 60, 150.00, 'Follow-up session, progress review', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @client1_id, NOW() + INTERVAL 10 DAY, 90, 200.00, 'Cognitive behavioral therapy, thought patterns', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- Therapist 1 - Maya Cohen (Couples therapy)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist1_id, @client2_id, NOW() - INTERVAL 5 DAY, 120, 250.00, 'Communication skills workshop, active listening', 'COMPLETED', TRUE, NOW() - INTERVAL 5 DAY, TRUE, NOW() - INTERVAL 5 DAY),
(@therapist1_id, @client2_id, NOW() - INTERVAL 12 DAY, 120, 250.00, 'Conflict resolution strategies, compromise techniques', 'COMPLETED', TRUE, NOW() - INTERVAL 12 DAY, TRUE, NOW() - INTERVAL 12 DAY),
(@therapist1_id, @client2_id, NOW() + INTERVAL 5 DAY, 120, 250.00, 'Relationship goals setting, future planning', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @client2_id, NOW() + INTERVAL 12 DAY, 120, 250.00, 'Intimacy building exercises, trust development', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- Therapist 2 - Sara Goldstein (Eating disorder)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist2_id, @client3_id, NOW() - INTERVAL 3 DAY, 90, 180.00, 'Body image work, self-acceptance exercises', 'COMPLETED', TRUE, NOW() - INTERVAL 3 DAY, TRUE, NOW() - INTERVAL 3 DAY),
(@therapist2_id, @client3_id, NOW() - INTERVAL 10 DAY, 90, 180.00, 'Nutrition counseling, meal planning support', 'COMPLETED', TRUE, NOW() - INTERVAL 10 DAY, TRUE, NOW() - INTERVAL 10 DAY),
(@therapist2_id, @client3_id, NOW() + INTERVAL 4 DAY, 90, 180.00, 'Emotional regulation, stress management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @client3_id, NOW() + INTERVAL 11 DAY, 90, 180.00, 'Relapse prevention, coping strategies', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- Therapist 2 - Tom Friedman (Substance abuse)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist2_id, @client4_id, NOW() - INTERVAL 1 DAY, 120, 200.00, '12-step program integration, sponsor connection', 'COMPLETED', TRUE, NOW() - INTERVAL 1 DAY, TRUE, NOW() - INTERVAL 1 DAY),
(@therapist2_id, @client4_id, NOW() - INTERVAL 8 DAY, 120, 200.00, 'Triggers identification, avoidance strategies', 'COMPLETED', TRUE, NOW() - INTERVAL 8 DAY, TRUE, NOW() - INTERVAL 8 DAY),
(@therapist2_id, @client4_id, NOW() + INTERVAL 6 DAY, 120, 200.00, 'Family therapy session, support system building', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @client4_id, NOW() + INTERVAL 13 DAY, 120, 200.00, 'Life skills development, employment support', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- Therapist 3 - Ella Johnson (Teen therapy)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist3_id, @client5_id, NOW() - INTERVAL 2 DAY, 60, 120.00, 'School anxiety management, test preparation', 'COMPLETED', TRUE, NOW() - INTERVAL 2 DAY, TRUE, NOW() - INTERVAL 2 DAY),
(@therapist3_id, @client5_id, NOW() - INTERVAL 9 DAY, 60, 120.00, 'Peer pressure handling, social skills', 'COMPLETED', TRUE, NOW() - INTERVAL 9 DAY, TRUE, NOW() - INTERVAL 9 DAY),
(@therapist3_id, @client5_id, NOW() + INTERVAL 7 DAY, 60, 120.00, 'Self-esteem building, confidence development', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @client5_id, NOW() + INTERVAL 14 DAY, 60, 120.00, 'Family communication, parent-teen relationship', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- Additional varied meetings for testing different scenarios
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
-- Cancelled meetings
(@therapist1_id, @client1_id, NOW() - INTERVAL 20 DAY, 60, 150.00, 'Client cancelled due to illness', 'CANCELLED', FALSE, NULL, TRUE, NOW() - INTERVAL 20 DAY),
(@therapist2_id, @client3_id, NOW() - INTERVAL 15 DAY, 90, 180.00, 'Emergency cancellation', 'CANCELLED', FALSE, NULL, TRUE, NOW() - INTERVAL 15 DAY),

-- No-show meetings
(@therapist1_id, @client2_id, NOW() - INTERVAL 25 DAY, 120, 250.00, 'Client did not show up', 'NO_SHOW', FALSE, NULL, TRUE, NOW() - INTERVAL 25 DAY),
(@therapist3_id, @client5_id, NOW() - INTERVAL 18 DAY, 60, 120.00, 'No-show, no contact', 'NO_SHOW', FALSE, NULL, TRUE, NOW() - INTERVAL 18 DAY),

-- Long sessions
(@therapist1_id, @client1_id, NOW() - INTERVAL 35 DAY, 180, 300.00, 'Extended session for crisis intervention', 'COMPLETED', TRUE, NOW() - INTERVAL 35 DAY, TRUE, NOW() - INTERVAL 35 DAY),
(@therapist2_id, @client4_id, NOW() - INTERVAL 40 DAY, 150, 250.00, 'Intensive therapy session', 'COMPLETED', TRUE, NOW() - INTERVAL 40 DAY, TRUE, NOW() - INTERVAL 40 DAY);

-- 5. Diverse Personal Meetings for all therapists
-- Therapist 1 - Personal Development Sessions
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist1_id, 'Dr. Sarah Cohen', 'PERSONAL_THERAPY', 'Therapist', 'Licensed Clinical Psychologist',
 NOW() - INTERVAL 7 DAY, 60, 150.00, 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 7 DAY),

(@therapist1_id, 'Dr. Michael Rosen', 'SUPERVISION', 'Supervisor', 'Senior Clinical Supervisor',
 NOW() - INTERVAL 14 DAY, 90, 200.00, 'COMPLETED', TRUE, TRUE, 'WEEKLY', NOW() + INTERVAL 7 DAY, TRUE, NOW() - INTERVAL 14 DAY),

(@therapist1_id, 'Dr. Rachel Green', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Trauma Therapy Specialist',
 NOW() - INTERVAL 21 DAY, 120, 250.00, 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 21 DAY),

(@therapist1_id, 'Dr. Michael Rosen', 'SUPERVISION', 'Supervisor', 'Senior Clinical Supervisor',
 NOW() + INTERVAL 7 DAY, 90, 200.00, 'SCHEDULED', FALSE, TRUE, 'WEEKLY', NOW() + INTERVAL 14 DAY, TRUE, NOW());

-- Therapist 2 - Professional Growth Sessions
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist2_id, 'Dr. David Levy', 'PERSONAL_THERAPY', 'Therapist', 'Licensed Clinical Social Worker',
 NOW() - INTERVAL 5 DAY, 60, 140.00, 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 5 DAY),

(@therapist2_id, 'Dr. Lisa Chen', 'TEACHING_SESSION', 'Teacher', 'EMDR Certified Trainer',
 NOW() - INTERVAL 12 DAY, 180, 300.00, 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 18 DAY, TRUE, NOW() - INTERVAL 12 DAY),

(@therapist2_id, 'Dr. James Wilson', 'SUPERVISION', 'Supervisor', 'Addiction Treatment Specialist',
 NOW() - INTERVAL 19 DAY, 90, 180.00, 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 19 DAY),

(@therapist2_id, 'Dr. Lisa Chen', 'TEACHING_SESSION', 'Teacher', 'EMDR Certified Trainer',
 NOW() + INTERVAL 18 DAY, 180, 300.00, 'SCHEDULED', FALSE, TRUE, 'MONTHLY', NOW() + INTERVAL 36 DAY, TRUE, NOW());

-- Therapist 3 - Skill Development Sessions
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist3_id, 'Dr. Rachel Green', 'PERSONAL_THERAPY', 'Therapist', 'Child and Adolescent Specialist',
 NOW() - INTERVAL 3 DAY, 60, 130.00, 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 3 DAY),

(@therapist3_id, 'Dr. Maria Rodriguez', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Play Therapy Expert',
 NOW() - INTERVAL 10 DAY, 120, 220.00, 'COMPLETED', TRUE, TRUE, 'QUARTERLY', NOW() + INTERVAL 65 DAY, TRUE, NOW() - INTERVAL 10 DAY),

(@therapist3_id, 'Dr. Robert Kim', 'SUPERVISION', 'Supervisor', 'Family Therapy Specialist',
 NOW() - INTERVAL 17 DAY, 90, 170.00, 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 17 DAY),

(@therapist3_id, 'Dr. Maria Rodriguez', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Play Therapy Expert',
 NOW() + INTERVAL 65 DAY, 120, 220.00, 'SCHEDULED', FALSE, TRUE, 'QUARTERLY', NOW() + INTERVAL 130 DAY, TRUE, NOW());

-- Guide Sessions (should create automatic expenses)
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist1_id, 'Dr. Elena Guide', 'PERSONAL_THERAPY', 'Guide', 'Spiritual Wellness Coach',
 NOW() - INTERVAL 2 DAY, 90, 180.00, 'COMPLETED', TRUE, TRUE, 'WEEKLY', NOW() + INTERVAL 5 DAY, TRUE, NOW() - INTERVAL 2 DAY),

(@therapist2_id, 'Dr. Carlos Guide', 'MINDFULNESS_SESSION', 'Guide', 'Meditation and Mindfulness Expert',
 NOW() - INTERVAL 9 DAY, 60, 160.00, 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 21 DAY, TRUE, NOW() - INTERVAL 9 DAY),

(@therapist3_id, 'Dr. Aisha Guide', 'WELLNESS_COACHING', 'Guide', 'Holistic Health Practitioner',
 NOW() - INTERVAL 16 DAY, 120, 200.00, 'COMPLETED', TRUE, TRUE, 'QUARTERLY', NOW() + INTERVAL 74 DAY, TRUE, NOW() - INTERVAL 16 DAY);

-- 6. Diverse Expenses for all therapists ----------------------------------------
-- Therapist 1 - Office & Professional Expenses
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Office & Rent
(@therapist1_id, 'Downtown Office Rent', 'Premium office space in medical district', 3500.00, 'ILS', 'Office & Rent', 'Monthly rent for prime location', NOW() - INTERVAL 30 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 5 DAY, TRUE, 'Bank Transfer', TRUE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(@therapist1_id, 'Office Utilities', 'Electricity, water, and internet', 450.00, 'ILS', 'Utilities', 'Monthly utilities for office', NOW() - INTERVAL 15 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 15 DAY, TRUE, 'Bank Transfer', TRUE, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),

-- Professional Development
(@therapist1_id, 'Trauma Therapy Certification', 'Advanced trauma therapy training program', 2500.00, 'ILS', 'Professional Development', 'Certification for trauma treatment', NOW() - INTERVAL 45 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY),
(@therapist1_id, 'Professional Conference', 'Annual psychology conference registration', 1200.00, 'ILS', 'Professional Development', 'Conference fees and materials', NOW() - INTERVAL 60 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 60 DAY),

-- Software & Tools
(@therapist1_id, 'Practice Management Software', 'Annual subscription for client management', 1800.00, 'ILS', 'Software & Tools', 'Complete practice management solution', NOW() - INTERVAL 20 DAY, TRUE, 'YEARLY', NOW() + INTERVAL 345 DAY, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY),
(@therapist1_id, 'Video Therapy Platform', 'Monthly subscription for online sessions', 200.00, 'ILS', 'Software & Tools', 'Secure video conferencing platform', NOW() - INTERVAL 10 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 20 DAY, FALSE, 'Credit Card', TRUE, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY);

-- Therapist 2 - Specialized Equipment & Training
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Equipment & Supplies
(@therapist2_id, 'EMDR Equipment', 'Professional EMDR equipment and supplies', 3500.00, 'ILS', 'Supplies & Equipment', 'EMDR therapy equipment', NOW() - INTERVAL 25 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),
(@therapist2_id, 'Assessment Tools', 'Psychological assessment kits and materials', 800.00, 'ILS', 'Supplies & Equipment', 'Professional assessment tools', NOW() - INTERVAL 40 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 40 DAY),

-- Insurance & Liability
(@therapist2_id, 'Professional Liability Insurance', 'Annual professional liability coverage', 2200.00, 'ILS', 'Insurance & Liability', 'Comprehensive liability insurance', NOW() - INTERVAL 50 DAY, TRUE, 'YEARLY', NOW() + INTERVAL 315 DAY, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 50 DAY),
(@therapist2_id, 'Health Insurance', 'Monthly health insurance premium', 550.00, 'ILS', 'Insurance & Liability', 'Personal health insurance', NOW() - INTERVAL 8 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 22 DAY, FALSE, 'Bank Transfer', TRUE, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),

-- Marketing & Advertising
(@therapist2_id, 'Website Development', 'Professional website design and hosting', 3000.00, 'ILS', 'Marketing & Advertising', 'New professional website', NOW() - INTERVAL 35 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 35 DAY),
(@therapist2_id, 'Google Ads Campaign', 'Monthly advertising budget', 600.00, 'ILS', 'Marketing & Advertising', 'Online advertising campaign', NOW() - INTERVAL 5 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 25 DAY, FALSE, 'Credit Card', TRUE, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY);

-- Therapist 3 - Child Therapy Specialization
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Child Therapy Equipment
(@therapist3_id, 'Play Therapy Equipment', 'Complete play therapy kit and toys', 1200.00, 'ILS', 'Supplies & Equipment', 'Play therapy materials and equipment', NOW() - INTERVAL 30 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(@therapist3_id, 'Art Therapy Supplies', 'Art therapy materials and supplies', 400.00, 'ILS', 'Supplies & Equipment', 'Art therapy materials', NOW() - INTERVAL 20 DAY, FALSE, NULL, NULL, TRUE, 'Cash', TRUE, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY),

-- Professional Development
(@therapist3_id, 'Child Psychology Certification', 'Specialized child psychology training', 1800.00, 'ILS', 'Professional Development', 'Child psychology certification', NOW() - INTERVAL 55 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 55 DAY, NOW() - INTERVAL 55 DAY),
(@therapist3_id, 'Family Therapy Workshop', 'Family therapy techniques workshop', 750.00, 'ILS', 'Professional Development', 'Family therapy training', NOW() - INTERVAL 70 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 70 DAY, NOW() - INTERVAL 70 DAY),

-- Office & Rent
(@therapist3_id, 'Child-Friendly Office Setup', 'Child-friendly office furniture and decor', 2500.00, 'ILS', 'Office & Rent', 'Child-friendly office setup', NOW() - INTERVAL 45 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY),
(@therapist3_id, 'Office Rent', 'Monthly office rental', 2800.00, 'ILS', 'Office & Rent', 'Monthly office rent', NOW() - INTERVAL 12 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 18 DAY, FALSE, 'Bank Transfer', TRUE, NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 12 DAY);

-- Additional varied expenses for testing different scenarios
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Recurring expenses
(@therapist1_id, 'Monthly Coffee & Refreshments', 'Monthly refreshments for clients', 200.00, 'ILS', 'Other', 'Monthly refreshments budget', NOW() - INTERVAL 7 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 23 DAY, FALSE, 'Cash', TRUE, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY),
(@therapist2_id, 'Quarterly Professional Journal', 'Quarterly professional journal subscription', 150.00, 'ILS', 'Professional Development', 'Professional journal subscription', NOW() - INTERVAL 15 DAY, TRUE, 'QUARTERLY', NOW() + INTERVAL 75 DAY, FALSE, 'Credit Card', TRUE, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),
(@therapist3_id, 'Annual Professional Association', 'Annual professional association membership', 300.00, 'ILS', 'Professional Development', 'Professional association fees', NOW() - INTERVAL 80 DAY, TRUE, 'YEARLY', NOW() + INTERVAL 285 DAY, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 80 DAY, NOW() - INTERVAL 80 DAY),

-- Large one-time expenses
(@therapist1_id, 'New Therapy Couch', 'Professional therapy couch and furniture', 4500.00, 'ILS', 'Supplies & Equipment', 'New therapy furniture', NOW() - INTERVAL 90 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 90 DAY, NOW() - INTERVAL 90 DAY),
(@therapist2_id, 'Security System Installation', 'Office security system installation', 3200.00, 'ILS', 'Supplies & Equipment', 'Office security system', NOW() - INTERVAL 100 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 100 DAY, NOW() - INTERVAL 100 DAY),

-- Unpaid expenses for testing
(@therapist1_id, 'Pending Software License', 'Pending software license renewal', 500.00, 'ILS', 'Software & Tools', 'Software license renewal', NOW() - INTERVAL 3 DAY, FALSE, NULL, NULL, FALSE, NULL, TRUE, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
(@therapist2_id, 'Unpaid Conference Fee', 'Upcoming conference registration', 800.00, 'ILS', 'Professional Development', 'Conference registration fee', NOW() - INTERVAL 1 DAY, FALSE, NULL, NULL, FALSE, NULL, TRUE, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY);

-- 7. Summary Statistics for Testing ----------------------------------------
-- This section provides a summary of the diverse data created for testing

-- Total Users: 4 (3 therapists + 1 admin)
-- Total Clients: 12 (5 for therapist1, 4 for therapist2, 3 for therapist3)
-- Total Meetings: 24+ (varied sessions across all therapists)
-- Total Personal Meetings: 12+ (diverse personal development sessions)
-- Total Expenses: 20+ (varied expense categories and scenarios)

-- Data includes:
-- ✅ Multiple therapists with different specializations
-- ✅ Diverse client profiles with realistic notes
-- ✅ Varied meeting types (completed, scheduled, cancelled, no-show)
-- ✅ Different session durations and pricing
-- ✅ Personal meetings with different provider types
-- ✅ Recurring and one-time expenses
-- ✅ Paid and unpaid items for testing payment toggles
-- ✅ Guide sessions for testing automatic expense creation
-- ✅ Realistic expense categories and amounts
-- ✅ Different payment methods and statuses

-- -----------------------------------------------------------------------
-- End of seed script
-- ----------------------------------------------------------------------- 