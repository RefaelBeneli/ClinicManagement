-- ULTRA-ENRICHED Seed data for ClinicManagement – run manually (NOT a Flyway migration)
-- ===============================================================================
-- This file contains MASSIVE mock data with multiple sessions per day, overlapping schedules,
-- diverse scenarios, and comprehensive testing data for all features

-- 1. EXTENSIVE Therapist users for comprehensive testing scenarios
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

('therapist4', 'therapist4@clinic.com', 'Dr. Michael Rosen', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 60 DAY),

('therapist5', 'therapist5@clinic.com', 'Dr. Lisa Chen', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 45 DAY),

('therapist6', 'therapist6@clinic.com', 'Dr. Jonathan Weiss', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 30 DAY),

('therapist7', 'therapist7@clinic.com', 'Dr. Miriam Goldstein', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 25 DAY),

('therapist8', 'therapist8@clinic.com', 'Dr. Aaron Cohen', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 20 DAY),

('therapist9', 'therapist9@clinic.com', 'Dr. Rebecca Stern', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 15 DAY),

('therapist10', 'therapist10@clinic.com', 'Dr. Daniel Friedman', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'USER', TRUE, 'APPROVED', NOW() - INTERVAL 10 DAY),

('admin1', 'admin@clinic.com', 'Admin Manager', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'ADMIN', TRUE, 'APPROVED', NOW() - INTERVAL 500 DAY),

('admin2', 'admin2@clinic.com', 'Senior Admin', 
 '$2a$10$L8PISC60cogAoJouDM0F/eZ3921DC0B3CLi/09Z3Oy3K/4wc91/2a', -- '123456'
 'ADMIN', TRUE, 'APPROVED', NOW() - INTERVAL 400 DAY);

SET @therapist1_id := (SELECT id FROM users WHERE username = 'therapist1');
SET @therapist2_id := (SELECT id FROM users WHERE username = 'therapist2');
SET @therapist3_id := (SELECT id FROM users WHERE username = 'therapist3');
SET @therapist4_id := (SELECT id FROM users WHERE username = 'therapist4');
SET @therapist5_id := (SELECT id FROM users WHERE username = 'therapist5');
SET @therapist6_id := (SELECT id FROM users WHERE username = 'therapist6');
SET @therapist7_id := (SELECT id FROM users WHERE username = 'therapist7');
SET @therapist8_id := (SELECT id FROM users WHERE username = 'therapist8');
SET @therapist9_id := (SELECT id FROM users WHERE username = 'therapist9');
SET @therapist10_id := (SELECT id FROM users WHERE username = 'therapist10');
SET @admin_id := (SELECT id FROM users WHERE username = 'admin1');
SET @admin2_id := (SELECT id FROM users WHERE username = 'admin2');

-- 3. MASSIVE Client Data for Comprehensive Testing
-- ================================================
-- Therapist 1 - High Volume Practice (12 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist1_id, 'Avi Rosenberg', 'avi.rosenberg@email.com', '050-123-4567', 'Prefers evening sessions, anxiety focus, 3 sessions per week', TRUE, NOW() - INTERVAL 300 DAY),
(@therapist1_id, 'Maya Cohen', 'maya.cohen@email.com', '052-234-5678', 'Couples therapy, communication issues, weekly sessions', TRUE, NOW() - INTERVAL 250 DAY),
(@therapist1_id, 'Yossi Levy', 'yossi.levy@email.com', '053-345-6789', 'Depression treatment, medication management, bi-weekly', TRUE, NOW() - INTERVAL 200 DAY),
(@therapist1_id, 'Rina Green', 'rina.green@email.com', '054-456-7890', 'Trauma therapy, EMDR specialist, intensive treatment', TRUE, NOW() - INTERVAL 150 DAY),
(@therapist1_id, 'Dani Brown', 'dani.brown@email.com', '055-567-8901', 'ADHD coaching, organizational skills, weekly', TRUE, NOW() - INTERVAL 100 DAY),
(@therapist1_id, 'Tamar Weiss', 'tamar.weiss@email.com', '056-678-9012', 'PTSD treatment, military veteran, 2 sessions per week', TRUE, NOW() - INTERVAL 80 DAY),
(@therapist1_id, 'Oren Klein', 'oren.klein@email.com', '057-789-0123', 'OCD treatment, exposure therapy, intensive', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist1_id, 'Shira David', 'shira.david@email.com', '058-890-1234', 'Borderline personality disorder, DBT therapy', TRUE, NOW() - INTERVAL 40 DAY),
(@therapist1_id, 'Yael Rosenberg', 'yael.rosenberg@email.com', '059-901-2345', 'Eating disorder recovery, intensive outpatient', TRUE, NOW() - INTERVAL 35 DAY),
(@therapist1_id, 'Moshe Klein', 'moshe.klein@email.com', '060-012-3456', 'Substance abuse counseling, relapse prevention', TRUE, NOW() - INTERVAL 30 DAY),
(@therapist1_id, 'Ruth Feldman', 'ruth.feldman@email.com', '061-123-4567', 'Grief counseling, loss of child, weekly sessions', TRUE, NOW() - INTERVAL 25 DAY),
(@therapist1_id, 'Eli Schwartz', 'eli.schwartz@email.com', '062-234-5678', 'Bipolar disorder, medication management', TRUE, NOW() - INTERVAL 20 DAY);

-- Therapist 2 - Specialized Practice (10 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist2_id, 'Sara Goldstein', 'sara.goldstein@email.com', '050-678-9012', 'Eating disorder recovery, 3 sessions per week', TRUE, NOW() - INTERVAL 280 DAY),
(@therapist2_id, 'Tom Friedman', 'tom.friedman@email.com', '052-789-0123', 'Substance abuse counseling, intensive outpatient', TRUE, NOW() - INTERVAL 220 DAY),
(@therapist2_id, 'Liora Schwartz', 'liora.schwartz@email.com', '053-890-1234', 'Grief counseling, loss of spouse, weekly', TRUE, NOW() - INTERVAL 180 DAY),
(@therapist2_id, 'Amir Hassan', 'amir.hassan@email.com', '054-901-2345', 'Cultural adjustment, immigrant support, bi-weekly', TRUE, NOW() - INTERVAL 120 DAY),
(@therapist2_id, 'Rachel Miller', 'rachel.miller@email.com', '055-012-3456', 'Bipolar disorder, medication management', TRUE, NOW() - INTERVAL 90 DAY),
(@therapist2_id, 'David Chen', 'david.chen@email.com', '056-123-4567', 'Schizophrenia, family therapy, weekly', TRUE, NOW() - INTERVAL 70 DAY),
(@therapist2_id, 'Leah Goldstein', 'leah.goldstein@email.com', '057-234-5678', 'Complex trauma, dissociation, intensive therapy', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist2_id, 'Isaac Cohen', 'isaac.cohen@email.com', '058-345-6789', 'Autism spectrum, social skills, weekly sessions', TRUE, NOW() - INTERVAL 50 DAY),
(@therapist2_id, 'Miriam Levy', 'miriam.levy@email.com', '059-456-7890', 'Postpartum depression, new mother support', TRUE, NOW() - INTERVAL 40 DAY);

-- Therapist 3 - Child & Family Practice (10 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist3_id, 'Ella Johnson', 'ella.johnson@email.com', '050-012-3456', 'Teen therapy, school anxiety, weekly', TRUE, NOW() - INTERVAL 90 DAY),
(@therapist3_id, 'Rafi Stern', 'rafi.stern@email.com', '052-123-4567', 'Work stress, burnout prevention, bi-weekly', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist3_id, 'Nina Patel', 'nina.patel@email.com', '053-234-5678', 'Pregnancy counseling, postpartum support', TRUE, NOW() - INTERVAL 45 DAY),
(@therapist3_id, 'Ben Cohen', 'ben.cohen@email.com', '054-345-6789', 'Child therapy, ADHD, play therapy', TRUE, NOW() - INTERVAL 30 DAY),
(@therapist3_id, 'Lily Rodriguez', 'lily.rodriguez@email.com', '055-456-7890', 'Family therapy, divorce adjustment', TRUE, NOW() - INTERVAL 25 DAY),
(@therapist3_id, 'Max Thompson', 'max.thompson@email.com', '056-567-8901', 'Autism spectrum, social skills training', TRUE, NOW() - INTERVAL 20 DAY),
(@therapist3_id, 'Sophie Williams', 'sophie.williams@email.com', '057-678-9012', 'Adolescent depression, CBT therapy', TRUE, NOW() - INTERVAL 15 DAY),
(@therapist3_id, 'Joshua Brown', 'joshua.brown@email.com', '058-789-0123', 'Child therapy, separation anxiety, play therapy', TRUE, NOW() - INTERVAL 12 DAY),
(@therapist3_id, 'Hannah Davis', 'hannah.davis@email.com', '059-890-1234', 'Family therapy, blended family issues', TRUE, NOW() - INTERVAL 10 DAY);

-- Therapist 4 - Trauma Specialist (8 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist4_id, 'Alex Turner', 'alex.turner@email.com', '058-789-0123', 'Complex PTSD, childhood trauma', TRUE, NOW() - INTERVAL 100 DAY),
(@therapist4_id, 'Maria Garcia', 'maria.garcia@email.com', '059-890-1234', 'Sexual assault survivor, EMDR therapy', TRUE, NOW() - INTERVAL 80 DAY),
(@therapist4_id, 'James Wilson', 'james.wilson@email.com', '060-901-2345', 'Combat trauma, military veteran', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist4_id, 'Sarah Kim', 'sarah.kim@email.com', '061-012-3456', 'Domestic violence survivor, safety planning', TRUE, NOW() - INTERVAL 40 DAY),
(@therapist4_id, 'Michael Brown', 'michael.brown@email.com', '062-123-4567', 'Accident trauma, phobia treatment', TRUE, NOW() - INTERVAL 20 DAY),
(@therapist4_id, 'Sarah Johnson', 'sarah.johnson@email.com', '063-234-5678', 'Sexual trauma, EMDR therapy, intensive', TRUE, NOW() - INTERVAL 15 DAY),
(@therapist4_id, 'David Wilson', 'david.wilson@email.com', '064-345-6789', 'Combat trauma, military veteran, group therapy', TRUE, NOW() - INTERVAL 12 DAY);

-- Therapist 5 - Couples & Family Specialist (8 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist5_id, 'Emma Davis', 'emma.davis@email.com', '063-234-5678', 'Marriage counseling, communication issues', TRUE, NOW() - INTERVAL 120 DAY),
(@therapist5_id, 'Ryan Martinez', 'ryan.martinez@email.com', '064-345-6789', 'Pre-marital counseling, relationship building', TRUE, NOW() - INTERVAL 90 DAY),
(@therapist5_id, 'Jessica Lee', 'jessica.lee@email.com', '065-456-7890', 'Divorce counseling, co-parenting support', TRUE, NOW() - INTERVAL 70 DAY),
(@therapist5_id, 'Daniel Anderson', 'daniel.anderson@email.com', '066-567-8901', 'Blended family therapy, step-parenting', TRUE, NOW() - INTERVAL 50 DAY),
(@therapist5_id, 'Amanda Taylor', 'amanda.taylor@email.com', '067-678-9012', 'LGBTQ+ couples therapy, identity support', TRUE, NOW() - INTERVAL 30 DAY),
(@therapist5_id, 'Christopher White', 'christopher.white@email.com', '068-789-0123', 'Long-distance relationship counseling', TRUE, NOW() - INTERVAL 15 DAY),
(@therapist5_id, 'Jennifer Lee', 'jennifer.lee@email.com', '069-890-1234', 'Pre-marital counseling, communication skills', TRUE, NOW() - INTERVAL 12 DAY),
(@therapist5_id, 'Robert Garcia', 'robert.garcia@email.com', '070-901-2345', 'Divorce mediation, co-parenting support', TRUE, NOW() - INTERVAL 10 DAY);

-- Additional Therapists with Clients
-- =================================

-- Therapist 6 - Addiction Specialist (8 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist6_id, 'Mark Thompson', 'mark.thompson@email.com', '071-012-3456', 'Alcohol addiction, 12-step program', TRUE, NOW() - INTERVAL 100 DAY),
(@therapist6_id, 'Lisa Rodriguez', 'lisa.rodriguez@email.com', '072-123-4567', 'Drug addiction, intensive outpatient', TRUE, NOW() - INTERVAL 90 DAY),
(@therapist6_id, 'James Miller', 'james.miller@email.com', '073-234-5678', 'Gambling addiction, cognitive therapy', TRUE, NOW() - INTERVAL 80 DAY),
(@therapist6_id, 'Anna Wilson', 'anna.wilson@email.com', '074-345-6789', 'Sex addiction, group therapy', TRUE, NOW() - INTERVAL 70 DAY),
(@therapist6_id, 'Carlos Martinez', 'carlos.martinez@email.com', '075-456-7890', 'Prescription drug abuse, detox support', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist6_id, 'Rachel Smith', 'rachel.smith@email.com', '076-567-8901', 'Internet addiction, digital detox', TRUE, NOW() - INTERVAL 50 DAY),
(@therapist6_id, 'Thomas Brown', 'thomas.brown@email.com', '077-678-9012', 'Shopping addiction, financial counseling', TRUE, NOW() - INTERVAL 40 DAY),
(@therapist6_id, 'Maria Lopez', 'maria.lopez@email.com', '078-789-0123', 'Food addiction, eating disorder', TRUE, NOW() - INTERVAL 30 DAY);

-- Therapist 7 - Child Psychology Specialist (10 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist7_id, 'Emma Johnson', 'emma.johnson@email.com', '079-890-1234', 'Child therapy, anxiety disorders', TRUE, NOW() - INTERVAL 120 DAY),
(@therapist7_id, 'Noah Williams', 'noah.williams@email.com', '080-901-2345', 'ADHD child, behavioral therapy', TRUE, NOW() - INTERVAL 110 DAY),
(@therapist7_id, 'Olivia Davis', 'olivia.davis@email.com', '081-012-3456', 'Autism spectrum, early intervention', TRUE, NOW() - INTERVAL 100 DAY),
(@therapist7_id, 'Liam Brown', 'liam.brown@email.com', '082-123-4567', 'Child trauma, play therapy', TRUE, NOW() - INTERVAL 90 DAY),
(@therapist7_id, 'Ava Miller', 'ava.miller@email.com', '083-234-5678', 'Learning disabilities, academic support', TRUE, NOW() - INTERVAL 80 DAY),
(@therapist7_id, 'Ethan Wilson', 'ethan.wilson@email.com', '084-345-6789', 'Social skills, peer relationships', TRUE, NOW() - INTERVAL 70 DAY),
(@therapist7_id, 'Sophia Moore', 'sophia.moore@email.com', '085-456-7890', 'Depression in children, art therapy', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist7_id, 'Mason Taylor', 'mason.taylor@email.com', '086-567-8901', 'Behavioral issues, parent training', TRUE, NOW() - INTERVAL 50 DAY),
(@therapist7_id, 'Isabella Anderson', 'isabella.anderson@email.com', '087-678-9012', 'Grief in children, loss of parent', TRUE, NOW() - INTERVAL 40 DAY),
(@therapist7_id, 'William Thomas', 'william.thomas@email.com', '088-789-0123', 'Divorce impact, family adjustment', TRUE, NOW() - INTERVAL 30 DAY);

-- Therapist 8 - Geriatric Psychology (6 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist8_id, 'Harold Smith', 'harold.smith@email.com', '089-890-1234', 'Elderly depression, life transition', TRUE, NOW() - INTERVAL 150 DAY),
(@therapist8_id, 'Dorothy Johnson', 'dorothy.johnson@email.com', '090-901-2345', 'Grief counseling, loss of spouse', TRUE, NOW() - INTERVAL 140 DAY),
(@therapist8_id, 'Robert Wilson', 'robert.wilson@email.com', '091-012-3456', 'Dementia support, family counseling', TRUE, NOW() - INTERVAL 130 DAY),
(@therapist8_id, 'Margaret Davis', 'margaret.davis@email.com', '092-123-4567', 'Anxiety in elderly, medication management', TRUE, NOW() - INTERVAL 120 DAY),
(@therapist8_id, 'Charles Brown', 'charles.brown@email.com', '093-234-5678', 'Retirement adjustment, purpose finding', TRUE, NOW() - INTERVAL 110 DAY),
(@therapist8_id, 'Helen Miller', 'helen.miller@email.com', '094-345-6789', 'Chronic pain, coping strategies', TRUE, NOW() - INTERVAL 100 DAY);

-- Therapist 9 - Sports Psychology (8 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist9_id, 'Alex Rodriguez', 'alex.rodriguez@email.com', '095-456-7890', 'Performance anxiety, sports psychology', TRUE, NOW() - INTERVAL 80 DAY),
(@therapist9_id, 'Jordan Smith', 'jordan.smith@email.com', '096-567-8901', 'Injury recovery, mental preparation', TRUE, NOW() - INTERVAL 70 DAY),
(@therapist9_id, 'Casey Johnson', 'casey.johnson@email.com', '097-678-9012', 'Team dynamics, leadership skills', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist9_id, 'Taylor Williams', 'taylor.williams@email.com', '098-789-0123', 'Competition stress, focus training', TRUE, NOW() - INTERVAL 50 DAY),
(@therapist9_id, 'Morgan Davis', 'morgan.davis@email.com', '099-890-1234', 'Career transition, post-sports life', TRUE, NOW() - INTERVAL 40 DAY),
(@therapist9_id, 'Riley Brown', 'riley.brown@email.com', '100-901-2345', 'Motivation issues, goal setting', TRUE, NOW() - INTERVAL 30 DAY),
(@therapist9_id, 'Quinn Miller', 'quinn.miller@email.com', '101-012-3456', 'Confidence building, mental toughness', TRUE, NOW() - INTERVAL 20 DAY),
(@therapist9_id, 'Avery Wilson', 'avery.wilson@email.com', '102-123-4567', 'Burnout prevention, work-life balance', TRUE, NOW() - INTERVAL 15 DAY);

-- Therapist 10 - Corporate Psychology (10 clients)
INSERT INTO clients (user_id, full_name, email, phone, notes, is_active, created_at)
VALUES 
(@therapist10_id, 'Sarah Chen', 'sarah.chen@email.com', '103-234-5678', 'Work stress, burnout management', TRUE, NOW() - INTERVAL 90 DAY),
(@therapist10_id, 'Michael O\'Connor', 'michael.oconnor@email.com', '104-345-6789', 'Leadership development, executive coaching', TRUE, NOW() - INTERVAL 80 DAY),
(@therapist10_id, 'Jennifer Park', 'jennifer.park@email.com', '105-456-7890', 'Workplace conflict, communication skills', TRUE, NOW() - INTERVAL 70 DAY),
(@therapist10_id, 'David Kim', 'david.kim@email.com', '106-567-8901', 'Career transition, job search support', TRUE, NOW() - INTERVAL 60 DAY),
(@therapist10_id, 'Lisa Thompson', 'lisa.thompson@email.com', '107-678-9012', 'Imposter syndrome, confidence building', TRUE, NOW() - INTERVAL 50 DAY),
(@therapist10_id, 'Robert Martinez', 'robert.martinez@email.com', '108-789-0123', 'Work-life balance, time management', TRUE, NOW() - INTERVAL 40 DAY),
(@therapist10_id, 'Amanda Lee', 'amanda.lee@email.com', '109-890-1234', 'Team dynamics, conflict resolution', TRUE, NOW() - INTERVAL 30 DAY),
(@therapist10_id, 'Christopher Wong', 'christopher.wong@email.com', '110-901-2345', 'Performance anxiety, public speaking', TRUE, NOW() - INTERVAL 20 DAY),
(@therapist10_id, 'Rachel Martinez', 'rachel.martinez@email.com', '111-012-3456', 'Organizational change, adaptation', TRUE, NOW() - INTERVAL 15 DAY),
(@therapist10_id, 'Daniel Patel', 'daniel.patel@email.com', '112-123-4567', 'Remote work challenges, isolation', TRUE, NOW() - INTERVAL 10 DAY);

-- Set client IDs for reference (multiple clients per therapist)
SET @avi_id := (SELECT id FROM clients WHERE full_name = 'Avi Rosenberg');
SET @maya_id := (SELECT id FROM clients WHERE full_name = 'Maya Cohen');
SET @yossi_id := (SELECT id FROM clients WHERE full_name = 'Yossi Levy');
SET @rina_id := (SELECT id FROM clients WHERE full_name = 'Rina Green');
SET @dani_id := (SELECT id FROM clients WHERE full_name = 'Dani Brown');
SET @tamar_id := (SELECT id FROM clients WHERE full_name = 'Tamar Weiss');
SET @oren_id := (SELECT id FROM clients WHERE full_name = 'Oren Klein');
SET @shira_id := (SELECT id FROM clients WHERE full_name = 'Shira David');

SET @sara_id := (SELECT id FROM clients WHERE full_name = 'Sara Goldstein');
SET @tom_id := (SELECT id FROM clients WHERE full_name = 'Tom Friedman');
SET @liora_id := (SELECT id FROM clients WHERE full_name = 'Liora Schwartz');
SET @amir_id := (SELECT id FROM clients WHERE full_name = 'Amir Hassan');
SET @rachel_id := (SELECT id FROM clients WHERE full_name = 'Rachel Miller');
SET @david_id := (SELECT id FROM clients WHERE full_name = 'David Chen');

SET @ella_id := (SELECT id FROM clients WHERE full_name = 'Ella Johnson');
SET @rafi_id := (SELECT id FROM clients WHERE full_name = 'Rafi Stern');
SET @nina_id := (SELECT id FROM clients WHERE full_name = 'Nina Patel');
SET @ben_id := (SELECT id FROM clients WHERE full_name = 'Ben Cohen');
SET @lily_id := (SELECT id FROM clients WHERE full_name = 'Lily Rodriguez');
SET @max_id := (SELECT id FROM clients WHERE full_name = 'Max Thompson');
SET @sophie_id := (SELECT id FROM clients WHERE full_name = 'Sophie Williams');

SET @alex_id := (SELECT id FROM clients WHERE full_name = 'Alex Turner');
SET @maria_id := (SELECT id FROM clients WHERE full_name = 'Maria Garcia');
SET @james_id := (SELECT id FROM clients WHERE full_name = 'James Wilson');
SET @sarah_id := (SELECT id FROM clients WHERE full_name = 'Sarah Kim');
SET @michael_id := (SELECT id FROM clients WHERE full_name = 'Michael Brown');

SET @emma_id := (SELECT id FROM clients WHERE full_name = 'Emma Davis');
SET @ryan_id := (SELECT id FROM clients WHERE full_name = 'Ryan Martinez');
SET @jessica_id := (SELECT id FROM clients WHERE full_name = 'Jessica Lee');
SET @daniel_id := (SELECT id FROM clients WHERE full_name = 'Daniel Anderson');
SET @amanda_id := (SELECT id FROM clients WHERE full_name = 'Amanda Taylor');
SET @christopher_id := (SELECT id FROM clients WHERE full_name = 'Christopher White');
SET @jennifer_id := (SELECT id FROM clients WHERE full_name = 'Jennifer Lee');
SET @robert_garcia_id := (SELECT id FROM clients WHERE full_name = 'Robert Garcia');

-- New Therapist 1 clients
SET @yael_id := (SELECT id FROM clients WHERE full_name = 'Yael Rosenberg');
SET @moshe_id := (SELECT id FROM clients WHERE full_name = 'Moshe Klein');
SET @ruth_id := (SELECT id FROM clients WHERE full_name = 'Ruth Feldman');
SET @eli_id := (SELECT id FROM clients WHERE full_name = 'Eli Schwartz');

-- New Therapist 2 clients
SET @leah_id := (SELECT id FROM clients WHERE full_name = 'Leah Goldstein');
SET @isaac_id := (SELECT id FROM clients WHERE full_name = 'Isaac Cohen');
SET @miriam_levy_id := (SELECT id FROM clients WHERE full_name = 'Miriam Levy');

-- New Therapist 3 clients
SET @joshua_id := (SELECT id FROM clients WHERE full_name = 'Joshua Brown');
SET @hannah_id := (SELECT id FROM clients WHERE full_name = 'Hannah Davis');

-- New Therapist 4 clients
SET @sarah_johnson_id := (SELECT id FROM clients WHERE full_name = 'Sarah Johnson');
SET @david_wilson_id := (SELECT id FROM clients WHERE full_name = 'David Wilson');

-- Therapist 6 clients (Addiction Specialist)
SET @mark_id := (SELECT id FROM clients WHERE full_name = 'Mark Thompson');
SET @lisa_rodriguez_id := (SELECT id FROM clients WHERE full_name = 'Lisa Rodriguez');
SET @james_miller_id := (SELECT id FROM clients WHERE full_name = 'James Miller');
SET @anna_id := (SELECT id FROM clients WHERE full_name = 'Anna Wilson');
SET @carlos_id := (SELECT id FROM clients WHERE full_name = 'Carlos Martinez');
SET @rachel_smith_id := (SELECT id FROM clients WHERE full_name = 'Rachel Smith');
SET @thomas_id := (SELECT id FROM clients WHERE full_name = 'Thomas Brown');
SET @maria_lopez_id := (SELECT id FROM clients WHERE full_name = 'Maria Lopez');

-- Therapist 7 clients (Child Psychology)
SET @emma_johnson_id := (SELECT id FROM clients WHERE full_name = 'Emma Johnson');
SET @noah_id := (SELECT id FROM clients WHERE full_name = 'Noah Williams');
SET @olivia_id := (SELECT id FROM clients WHERE full_name = 'Olivia Davis');
SET @liam_id := (SELECT id FROM clients WHERE full_name = 'Liam Brown');
SET @ava_id := (SELECT id FROM clients WHERE full_name = 'Ava Miller');
SET @ethan_id := (SELECT id FROM clients WHERE full_name = 'Ethan Wilson');
SET @sophia_id := (SELECT id FROM clients WHERE full_name = 'Sophia Moore');
SET @mason_id := (SELECT id FROM clients WHERE full_name = 'Mason Taylor');
SET @isabella_id := (SELECT id FROM clients WHERE full_name = 'Isabella Anderson');
SET @william_id := (SELECT id FROM clients WHERE full_name = 'William Thomas');

-- Therapist 8 clients (Geriatric Psychology)
SET @harold_id := (SELECT id FROM clients WHERE full_name = 'Harold Smith');
SET @dorothy_id := (SELECT id FROM clients WHERE full_name = 'Dorothy Johnson');
SET @robert_wilson_id := (SELECT id FROM clients WHERE full_name = 'Robert Wilson');
SET @margaret_id := (SELECT id FROM clients WHERE full_name = 'Margaret Davis');
SET @charles_id := (SELECT id FROM clients WHERE full_name = 'Charles Brown');
SET @helen_id := (SELECT id FROM clients WHERE full_name = 'Helen Miller');

-- Therapist 9 clients (Sports Psychology)
SET @alex_rodriguez_id := (SELECT id FROM clients WHERE full_name = 'Alex Rodriguez');
SET @jordan_id := (SELECT id FROM clients WHERE full_name = 'Jordan Smith');
SET @casey_id := (SELECT id FROM clients WHERE full_name = 'Casey Johnson');
SET @taylor_id := (SELECT id FROM clients WHERE full_name = 'Taylor Williams');
SET @morgan_id := (SELECT id FROM clients WHERE full_name = 'Morgan Davis');
SET @riley_id := (SELECT id FROM clients WHERE full_name = 'Riley Brown');
SET @quinn_id := (SELECT id FROM clients WHERE full_name = 'Quinn Miller');
SET @avery_id := (SELECT id FROM clients WHERE full_name = 'Avery Wilson');

-- Therapist 10 clients (Corporate Psychology)
SET @sarah_chen_id := (SELECT id FROM clients WHERE full_name = 'Sarah Chen');
SET @michael_oconnor_id := (SELECT id FROM clients WHERE full_name = 'Michael O\'Connor');
SET @jennifer_park_id := (SELECT id FROM clients WHERE full_name = 'Jennifer Park');
SET @david_kim_id := (SELECT id FROM clients WHERE full_name = 'David Kim');
SET @lisa_thompson_id := (SELECT id FROM clients WHERE full_name = 'Lisa Thompson');
SET @robert_martinez_id := (SELECT id FROM clients WHERE full_name = 'Robert Martinez');
SET @amanda_lee_id := (SELECT id FROM clients WHERE full_name = 'Amanda Lee');
SET @christopher_wong_id := (SELECT id FROM clients WHERE full_name = 'Christopher Wong');
SET @rachel_martinez_id := (SELECT id FROM clients WHERE full_name = 'Rachel Martinez');
SET @daniel_patel_id := (SELECT id FROM clients WHERE full_name = 'Daniel Patel');

-- 4. MASSIVE Session Data with Multiple Sessions Per Day and Overlapping Schedules
-- ==============================================================================
-- THERAPIST 1 - HIGH VOLUME PRACTICE (Multiple sessions per day with overlapping times)

-- TODAY - Multiple sessions per day (Busy day scenario)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, summary, status, is_paid, payment_date, is_active, created_at)
VALUES 
-- Morning sessions (9:00-12:00)
(@therapist1_id, @avi_id, CONCAT(CURDATE(), ' 09:00:00'), 60, 150.00, 'Anxiety management, morning session', 'Client showed significant progress in managing anxiety symptoms. Used breathing techniques and cognitive restructuring. Homework assigned for daily practice.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @maya_id, CONCAT(CURDATE(), ' 10:30:00'), 90, 200.00, 'Couples therapy, communication workshop', 'Intensive communication workshop focused on active listening and "I" statements. Both partners engaged well and practiced new techniques. Breakthrough in understanding each other\'s perspectives.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- Afternoon sessions (13:00-17:00)
(@therapist1_id, @yossi_id, CONCAT(CURDATE(), ' 13:00:00'), 60, 150.00, 'Depression treatment, medication review', 'Client reported improved mood and energy levels. Medication dosage adjusted based on symptoms. Discussed coping strategies for low periods.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @rina_id, CONCAT(CURDATE(), ' 14:30:00'), 90, 200.00, 'EMDR therapy, trauma processing', 'Intensive EMDR session focused on childhood trauma. Client experienced significant emotional breakthrough. Processing continued with bilateral stimulation techniques.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @dani_id, CONCAT(CURDATE(), ' 16:00:00'), 60, 150.00, 'ADHD coaching, organizational skills', 'Worked on time management strategies and organizational systems. Client implemented new planning techniques with positive results. Focus on executive function skills.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- Evening sessions (18:00-21:00)
(@therapist1_id, @tamar_id, CONCAT(CURDATE(), ' 18:00:00'), 90, 200.00, 'PTSD treatment, military trauma', 'Military trauma processing session using exposure therapy. Client showed resilience in confronting traumatic memories. Grounding techniques practiced.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @oren_id, CONCAT(CURDATE(), ' 19:30:00'), 60, 150.00, 'OCD treatment, exposure therapy', 'ERP therapy session focusing on contamination fears. Client demonstrated courage in exposure exercises. Response prevention techniques reinforced.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- Additional sessions for Therapist 1 today (overlapping schedule)
(@therapist1_id, @yael_id, CONCAT(CURDATE(), ' 08:00:00'), 90, 200.00, 'Early morning eating disorder session', 'Early morning session focused on meal planning and body image work. Client showed progress in challenging negative thoughts about food and body.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @moshe_id, CONCAT(CURDATE(), ' 11:00:00'), 120, 250.00, 'Substance abuse intensive session', 'Intensive substance abuse counseling with relapse prevention focus. Client committed to 12-step program participation. Family support system strengthened.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @ruth_id, CONCAT(CURDATE(), ' 12:00:00'), 60, 150.00, 'Grief counseling, loss processing', 'Grief counseling session focusing on loss of child. Client expressed complex emotions including anger and guilt. Memorial planning discussed.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @eli_id, CONCAT(CURDATE(), ' 20:00:00'), 90, 200.00, 'Evening bipolar disorder session', 'Evening session for bipolar disorder management. Mood stabilization techniques reviewed. Medication compliance and side effects discussed.', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- TOMORROW - Another busy day
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, summary, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist1_id, @shira_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 09:00:00'), 90, 200.00, 'DBT therapy, emotion regulation', 'DBT session focused on emotion regulation skills. Client practiced distress tolerance techniques and interpersonal effectiveness. Significant progress in managing intense emotions.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @avi_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:30:00'), 60, 150.00, 'Anxiety follow-up, progress check', 'Follow-up session to assess anxiety management progress. Client reported reduced panic attacks and improved coping strategies. Homework compliance was excellent.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @maya_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), 120, 250.00, 'Couples intensive session', 'Intensive couples therapy session addressing deep-rooted communication patterns. Breakthrough in understanding attachment styles and relationship dynamics.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @yossi_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), 60, 150.00, 'Depression treatment, CBT', 'CBT session focusing on cognitive restructuring and behavioral activation. Client identified negative thought patterns and practiced challenging them.', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @rina_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:00:00'), 90, 200.00, 'EMDR therapy, trauma work', 'Continued EMDR therapy for trauma processing. Client showed increased resilience and reduced emotional reactivity to triggers.', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- THIS WEEK - Multiple sessions per day for different clients
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
-- Wednesday (3 days from now)
(@therapist1_id, @dani_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 09:00:00'), 60, 150.00, 'ADHD coaching, time management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @tamar_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 10:30:00'), 90, 200.00, 'PTSD treatment, grounding techniques', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @oren_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 14:00:00'), 60, 150.00, 'OCD treatment, ERP therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @shira_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 15:30:00'), 90, 200.00, 'DBT therapy, interpersonal skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @avi_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 17:00:00'), 60, 150.00, 'Anxiety management, evening session', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- Friday (5 days from now)
(@therapist1_id, @maya_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 09:00:00'), 120, 250.00, 'Couples therapy, conflict resolution', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @yossi_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 11:30:00'), 60, 150.00, 'Depression treatment, medication check', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @rina_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 13:00:00'), 90, 200.00, 'EMDR therapy, trauma processing', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @dani_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 15:00:00'), 60, 150.00, 'ADHD coaching, executive function', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @tamar_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 16:30:00'), 90, 200.00, 'PTSD treatment, exposure therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist1_id, @oren_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 18:00:00'), 60, 150.00, 'OCD treatment, response prevention', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- THERAPIST 2 - SPECIALIZED PRACTICE (Eating disorders, substance abuse)
-- TODAY - Multiple sessions
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist2_id, @sara_id, CONCAT(CURDATE(), ' 09:00:00'), 90, 180.00, 'Eating disorder recovery, body image work', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @tom_id, CONCAT(CURDATE(), ' 11:00:00'), 120, 200.00, 'Substance abuse counseling, relapse prevention', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @liora_id, CONCAT(CURDATE(), ' 14:00:00'), 60, 150.00, 'Grief counseling, loss processing', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @amir_id, CONCAT(CURDATE(), ' 15:30:00'), 90, 180.00, 'Cultural adjustment, immigrant support', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @rachel_id, CONCAT(CURDATE(), ' 17:00:00'), 60, 150.00, 'Bipolar disorder, medication management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @david_id, CONCAT(CURDATE(), ' 18:30:00'), 90, 180.00, 'Schizophrenia, family therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- TOMORROW - Another busy day
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist2_id, @sara_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:00:00'), 90, 180.00, 'Eating disorder, nutrition counseling', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @tom_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 12:00:00'), 120, 200.00, 'Substance abuse, 12-step integration', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @liora_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:00:00'), 60, 150.00, 'Grief counseling, memorial planning', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @amir_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:30:00'), 90, 180.00, 'Cultural adjustment, language barriers', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @rachel_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:00:00'), 60, 150.00, 'Bipolar disorder, mood stabilization', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- THIS WEEK - Multiple sessions per day
(@therapist2_id, @sara_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 09:00:00'), 90, 180.00, 'Eating disorder, meal planning', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @tom_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 11:00:00'), 120, 200.00, 'Substance abuse, triggers identification', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @david_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 14:00:00'), 90, 180.00, 'Schizophrenia, medication compliance', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @liora_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 16:00:00'), 60, 150.00, 'Grief counseling, support group', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @amir_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 17:30:00'), 90, 180.00, 'Cultural adjustment, community resources', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- THERAPIST 6 - ADDICTION SPECIALIST (Extensive Schedule)
-- TODAY - Multiple addiction sessions
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist6_id, @mark_id, CONCAT(CURDATE(), ' 08:00:00'), 90, 200.00, 'Alcohol addiction, 12-step integration', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @lisa_rodriguez_id, CONCAT(CURDATE(), ' 09:30:00'), 120, 250.00, 'Drug addiction, intensive outpatient', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @james_miller_id, CONCAT(CURDATE(), ' 11:30:00'), 90, 200.00, 'Gambling addiction, cognitive therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @anna_id, CONCAT(CURDATE(), ' 13:00:00'), 60, 150.00, 'Sex addiction, group therapy prep', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @carlos_id, CONCAT(CURDATE(), ' 14:30:00'), 120, 250.00, 'Prescription drug abuse, detox support', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @rachel_smith_id, CONCAT(CURDATE(), ' 16:30:00'), 90, 200.00, 'Internet addiction, digital detox', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @thomas_id, CONCAT(CURDATE(), ' 18:00:00'), 60, 150.00, 'Shopping addiction, financial counseling', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @maria_lopez_id, CONCAT(CURDATE(), ' 19:30:00'), 90, 200.00, 'Food addiction, eating disorder', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- TOMORROW - Another intensive day
(@therapist6_id, @mark_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 120, 250.00, 'Alcohol addiction, relapse prevention', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @lisa_rodriguez_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:30:00'), 90, 200.00, 'Drug addiction, triggers identification', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @james_miller_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 12:30:00'), 60, 150.00, 'Gambling addiction, financial planning', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @anna_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), 90, 200.00, 'Sex addiction, relationship skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @carlos_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:30:00'), 120, 250.00, 'Prescription drug abuse, medication management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @rachel_smith_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 17:30:00'), 90, 200.00, 'Internet addiction, screen time management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @thomas_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 19:00:00'), 60, 150.00, 'Shopping addiction, budget planning', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist6_id, @maria_lopez_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 20:30:00'), 90, 200.00, 'Food addiction, meal planning', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- THERAPIST 7 - CHILD PSYCHOLOGY SPECIALIST (Multiple child sessions)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist7_id, @emma_johnson_id, CONCAT(CURDATE(), ' 09:00:00'), 60, 120.00, 'Child therapy, anxiety disorders', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @noah_id, CONCAT(CURDATE(), ' 10:00:00'), 90, 150.00, 'ADHD child, behavioral therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @olivia_id, CONCAT(CURDATE(), ' 11:30:00'), 60, 120.00, 'Autism spectrum, early intervention', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @liam_id, CONCAT(CURDATE(), ' 12:30:00'), 90, 150.00, 'Child trauma, play therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @ava_id, CONCAT(CURDATE(), ' 14:00:00'), 60, 120.00, 'Learning disabilities, academic support', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @ethan_id, CONCAT(CURDATE(), ' 15:00:00'), 90, 150.00, 'Social skills, peer relationships', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @sophia_id, CONCAT(CURDATE(), ' 16:30:00'), 60, 120.00, 'Depression in children, art therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @mason_id, CONCAT(CURDATE(), ' 17:30:00'), 90, 150.00, 'Behavioral issues, parent training', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @isabella_id, CONCAT(CURDATE(), ' 18:30:00'), 60, 120.00, 'Grief in children, loss of parent', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @william_id, CONCAT(CURDATE(), ' 19:30:00'), 90, 150.00, 'Divorce impact, family adjustment', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- TOMORROW - Another busy day
(@therapist7_id, @emma_johnson_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 60, 120.00, 'Child therapy, anxiety management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @noah_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 09:00:00'), 90, 150.00, 'ADHD child, focus training', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @olivia_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:30:00'), 60, 120.00, 'Autism spectrum, communication skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @liam_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:30:00'), 90, 150.00, 'Child trauma, emotional regulation', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @ava_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 13:00:00'), 60, 120.00, 'Learning disabilities, study skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @ethan_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), 90, 150.00, 'Social skills, conflict resolution', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @sophia_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:30:00'), 60, 120.00, 'Depression in children, self-esteem', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @mason_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:30:00'), 90, 150.00, 'Behavioral issues, positive reinforcement', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @isabella_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 17:30:00'), 60, 120.00, 'Grief in children, memory work', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist7_id, @william_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:30:00'), 90, 150.00, 'Divorce impact, co-parenting support', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- THERAPIST 8 - GERIATRIC PSYCHOLOGY (Elderly clients)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist8_id, @harold_id, CONCAT(CURDATE(), ' 10:00:00'), 60, 130.00, 'Elderly depression, life transition', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @dorothy_id, CONCAT(CURDATE(), ' 11:00:00'), 90, 160.00, 'Grief counseling, loss of spouse', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @robert_wilson_id, CONCAT(CURDATE(), ' 12:30:00'), 60, 130.00, 'Dementia support, family counseling', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @margaret_id, CONCAT(CURDATE(), ' 13:30:00'), 90, 160.00, 'Anxiety in elderly, medication management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @charles_id, CONCAT(CURDATE(), ' 15:00:00'), 60, 130.00, 'Retirement adjustment, purpose finding', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @helen_id, CONCAT(CURDATE(), ' 16:00:00'), 90, 160.00, 'Chronic pain, coping strategies', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- TOMORROW - Another day
(@therapist8_id, @harold_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 09:00:00'), 60, 130.00, 'Elderly depression, social connection', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @dorothy_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:00:00'), 90, 160.00, 'Grief counseling, memorial planning', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @robert_wilson_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:30:00'), 60, 130.00, 'Dementia support, caregiver stress', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @margaret_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 12:30:00'), 90, 160.00, 'Anxiety in elderly, relaxation techniques', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @charles_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), 60, 130.00, 'Retirement adjustment, new hobbies', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist8_id, @helen_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:00:00'), 90, 160.00, 'Chronic pain, mindfulness techniques', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- THERAPIST 9 - SPORTS PSYCHOLOGY (Athlete clients)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist9_id, @alex_rodriguez_id, CONCAT(CURDATE(), ' 07:00:00'), 60, 180.00, 'Performance anxiety, sports psychology', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @jordan_id, CONCAT(CURDATE(), ' 08:00:00'), 90, 220.00, 'Injury recovery, mental preparation', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @casey_id, CONCAT(CURDATE(), ' 09:30:00'), 60, 180.00, 'Team dynamics, leadership skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @taylor_id, CONCAT(CURDATE(), ' 10:30:00'), 90, 220.00, 'Competition stress, focus training', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @morgan_id, CONCAT(CURDATE(), ' 12:00:00'), 60, 180.00, 'Career transition, post-sports life', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @riley_id, CONCAT(CURDATE(), ' 13:00:00'), 90, 220.00, 'Motivation issues, goal setting', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @quinn_id, CONCAT(CURDATE(), ' 14:30:00'), 60, 180.00, 'Confidence building, mental toughness', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @avery_id, CONCAT(CURDATE(), ' 15:30:00'), 90, 220.00, 'Burnout prevention, work-life balance', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- TOMORROW - Another day
(@therapist9_id, @alex_rodriguez_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 06:00:00'), 60, 180.00, 'Performance anxiety, visualization', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @jordan_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 07:00:00'), 90, 220.00, 'Injury recovery, return to play', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @casey_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:30:00'), 60, 180.00, 'Team dynamics, conflict resolution', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @taylor_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 09:30:00'), 90, 220.00, 'Competition stress, pressure management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @morgan_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:00:00'), 60, 180.00, 'Career transition, identity work', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @riley_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 12:00:00'), 90, 220.00, 'Motivation issues, intrinsic motivation', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @quinn_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 13:30:00'), 60, 180.00, 'Confidence building, self-talk', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist9_id, @avery_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:30:00'), 90, 220.00, 'Burnout prevention, recovery strategies', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- THERAPIST 10 - CORPORATE PSYCHOLOGY (Business clients)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist10_id, @sarah_chen_id, CONCAT(CURDATE(), ' 08:00:00'), 60, 200.00, 'Work stress, burnout management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @michael_oconnor_id, CONCAT(CURDATE(), ' 09:00:00'), 90, 250.00, 'Leadership development, executive coaching', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @jennifer_park_id, CONCAT(CURDATE(), ' 10:30:00'), 60, 200.00, 'Workplace conflict, communication skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @david_kim_id, CONCAT(CURDATE(), ' 11:30:00'), 90, 250.00, 'Career transition, job search support', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @lisa_thompson_id, CONCAT(CURDATE(), ' 13:00:00'), 60, 200.00, 'Imposter syndrome, confidence building', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @robert_martinez_id, CONCAT(CURDATE(), ' 14:00:00'), 90, 250.00, 'Work-life balance, time management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @amanda_lee_id, CONCAT(CURDATE(), ' 15:30:00'), 60, 200.00, 'Team dynamics, conflict resolution', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @christopher_wong_id, CONCAT(CURDATE(), ' 16:30:00'), 90, 250.00, 'Performance anxiety, public speaking', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @rachel_martinez_id, CONCAT(CURDATE(), ' 18:00:00'), 60, 200.00, 'Organizational change, adaptation', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @daniel_patel_id, CONCAT(CURDATE(), ' 19:00:00'), 90, 250.00, 'Remote work challenges, isolation', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- TOMORROW - Another busy day
(@therapist10_id, @sarah_chen_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 07:00:00'), 60, 200.00, 'Work stress, boundary setting', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @michael_oconnor_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 90, 250.00, 'Leadership development, strategic thinking', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @jennifer_park_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 09:30:00'), 60, 200.00, 'Workplace conflict, negotiation skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @david_kim_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:30:00'), 90, 250.00, 'Career transition, networking skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @lisa_thompson_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 12:00:00'), 60, 200.00, 'Imposter syndrome, self-validation', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @robert_martinez_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 13:00:00'), 90, 250.00, 'Work-life balance, priority setting', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @amanda_lee_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:30:00'), 60, 200.00, 'Team dynamics, collaboration skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @christopher_wong_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:30:00'), 90, 250.00, 'Performance anxiety, presentation skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @rachel_martinez_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'), 60, 200.00, 'Organizational change, resilience', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist10_id, @daniel_patel_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:00:00'), 90, 250.00, 'Remote work challenges, connection building', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- THERAPIST 3 - CHILD & FAMILY PRACTICE
-- TODAY - Multiple child and family sessions
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist3_id, @ella_id, CONCAT(CURDATE(), ' 09:00:00'), 60, 120.00, 'Teen therapy, school anxiety management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @rafi_id, CONCAT(CURDATE(), ' 10:30:00'), 60, 120.00, 'Work stress, burnout prevention', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @nina_id, CONCAT(CURDATE(), ' 14:00:00'), 90, 150.00, 'Pregnancy counseling, postpartum support', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @ben_id, CONCAT(CURDATE(), ' 15:30:00'), 60, 120.00, 'Child therapy, ADHD, play therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @lily_id, CONCAT(CURDATE(), ' 17:00:00'), 90, 150.00, 'Family therapy, divorce adjustment', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @max_id, CONCAT(CURDATE(), ' 18:30:00'), 60, 120.00, 'Autism spectrum, social skills training', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- TOMORROW - Another busy day
(@therapist3_id, @sophie_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 09:00:00'), 60, 120.00, 'Adolescent depression, CBT therapy', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @ella_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:30:00'), 60, 120.00, 'Teen therapy, peer pressure handling', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @rafi_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), 60, 120.00, 'Work stress, time management', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @nina_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:30:00'), 90, 150.00, 'Pregnancy counseling, birth preparation', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @ben_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'), 60, 120.00, 'Child therapy, emotional regulation', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @lily_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:30:00'), 90, 150.00, 'Family therapy, communication skills', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),

-- THIS WEEK - Multiple sessions per day
(@therapist3_id, @max_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 09:00:00'), 60, 120.00, 'Autism spectrum, sensory integration', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @sophie_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 10:30:00'), 60, 120.00, 'Adolescent depression, self-esteem work', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @ella_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 14:00:00'), 60, 120.00, 'Teen therapy, family communication', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @rafi_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 15:30:00'), 60, 120.00, 'Work stress, boundary setting', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @nina_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 17:00:00'), 90, 150.00, 'Pregnancy counseling, partner support', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @ben_id, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 18:30:00'), 60, 120.00, 'Child therapy, parent consultation', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- Therapist 2 - Tom Friedman (Substance abuse)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist2_id, @tom_id, NOW() - INTERVAL 1 DAY, 120, 200.00, '12-step program integration, sponsor connection', 'COMPLETED', TRUE, NOW() - INTERVAL 1 DAY, TRUE, NOW() - INTERVAL 1 DAY),
(@therapist2_id, @tom_id, NOW() - INTERVAL 8 DAY, 120, 200.00, 'Triggers identification, avoidance strategies', 'COMPLETED', TRUE, NOW() - INTERVAL 8 DAY, TRUE, NOW() - INTERVAL 8 DAY),
(@therapist2_id, @tom_id, NOW() + INTERVAL 6 DAY, 120, 200.00, 'Family therapy session, support system building', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist2_id, @tom_id, NOW() + INTERVAL 13 DAY, 120, 200.00, 'Life skills development, employment support', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- Therapist 3 - Ella Johnson (Teen therapy)
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
(@therapist3_id, @ella_id, NOW() - INTERVAL 2 DAY, 60, 120.00, 'School anxiety management, test preparation', 'COMPLETED', TRUE, NOW() - INTERVAL 2 DAY, TRUE, NOW() - INTERVAL 2 DAY),
(@therapist3_id, @ella_id, NOW() - INTERVAL 9 DAY, 60, 120.00, 'Peer pressure handling, social skills', 'COMPLETED', TRUE, NOW() - INTERVAL 9 DAY, TRUE, NOW() - INTERVAL 9 DAY),
(@therapist3_id, @ella_id, NOW() + INTERVAL 7 DAY, 60, 120.00, 'Self-esteem building, confidence development', 'SCHEDULED', FALSE, NULL, TRUE, NOW()),
(@therapist3_id, @ella_id, NOW() + INTERVAL 14 DAY, 60, 120.00, 'Family communication, parent-teen relationship', 'SCHEDULED', FALSE, NULL, TRUE, NOW());

-- Additional varied meetings for testing different scenarios
INSERT INTO meetings (user_id, client_id, meeting_date, duration, price, notes, status, is_paid, payment_date, is_active, created_at)
VALUES 
-- Cancelled meetings
(@therapist1_id, @avi_id, NOW() - INTERVAL 20 DAY, 60, 150.00, 'Client cancelled due to illness', 'CANCELLED', FALSE, NULL, TRUE, NOW() - INTERVAL 20 DAY),
(@therapist2_id, @sara_id, NOW() - INTERVAL 15 DAY, 90, 180.00, 'Emergency cancellation', 'CANCELLED', FALSE, NULL, TRUE, NOW() - INTERVAL 15 DAY),

-- No-show meetings
(@therapist1_id, @maya_id, NOW() - INTERVAL 25 DAY, 120, 250.00, 'Client did not show up', 'NO_SHOW', FALSE, NULL, TRUE, NOW() - INTERVAL 25 DAY),
(@therapist3_id, @ella_id, NOW() - INTERVAL 18 DAY, 60, 120.00, 'No-show, no contact', 'NO_SHOW', FALSE, NULL, TRUE, NOW() - INTERVAL 18 DAY),

-- Long sessions
(@therapist1_id, @avi_id, NOW() - INTERVAL 35 DAY, 180, 300.00, 'Extended session for crisis intervention', 'COMPLETED', TRUE, NOW() - INTERVAL 35 DAY, TRUE, NOW() - INTERVAL 35 DAY),
(@therapist2_id, @tom_id, NOW() - INTERVAL 40 DAY, 150, 250.00, 'Intensive therapy session', 'COMPLETED', TRUE, NOW() - INTERVAL 40 DAY, TRUE, NOW() - INTERVAL 40 DAY);

-- 5. Diverse Personal Meetings for all therapists
-- Therapist 1 - Personal Development Sessions
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist1_id, 'Dr. Sarah Cohen', 'PERSONAL_THERAPY', 'Therapist', 'Licensed Clinical Psychologist',
 NOW() - INTERVAL 7 DAY, 60, 150.00, 'Personal therapy session focusing on work-life balance', 'Personal therapy session focused on therapist self-care and professional development. Discussed work-life balance, stress management techniques, and maintaining professional boundaries. Explored strategies for preventing burnout and maintaining personal well-being while supporting clients effectively.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 7 DAY),

(@therapist1_id, 'Dr. Michael Rosen', 'SUPERVISION', 'Supervisor', 'Senior Clinical Supervisor',
 NOW() - INTERVAL 14 DAY, 90, 200.00, 'Weekly supervision covering complex cases', 'Supervision session covering complex case management and ethical considerations. Reviewed treatment plans for trauma clients, discussed professional boundaries, and explored countertransference issues. Enhanced clinical decision-making skills and professional development.', 'COMPLETED', TRUE, TRUE, 'WEEKLY', NOW() + INTERVAL 7 DAY, TRUE, NOW() - INTERVAL 14 DAY),

(@therapist1_id, 'Dr. Rachel Green', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Trauma Therapy Specialist',
 NOW() - INTERVAL 21 DAY, 120, 250.00, 'Advanced trauma therapy training', 'Professional development workshop on advanced therapeutic techniques for trauma treatment. Learned new intervention strategies, assessment tools, and evidence-based practices. Enhanced skills in trauma-informed care and specialized therapeutic approaches.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 21 DAY),

(@therapist1_id, 'Dr. Michael Rosen', 'SUPERVISION', 'Supervisor', 'Senior Clinical Supervisor',
 NOW() + INTERVAL 7 DAY, 90, 200.00, 'Upcoming supervision session', 'Scheduled supervision session to review ongoing cases and professional development goals. Will discuss recent client progress, ethical dilemmas, and continuing education opportunities.', 'SCHEDULED', FALSE, TRUE, 'WEEKLY', NOW() + INTERVAL 14 DAY, TRUE, NOW());

-- Therapist 2 - Professional Growth Sessions
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist2_id, 'Dr. David Levy', 'PERSONAL_THERAPY', 'Therapist', 'Licensed Clinical Social Worker',
 NOW() - INTERVAL 5 DAY, 60, 140.00, 'Personal therapy for professional development', 'Personal therapy session focusing on therapist self-care and professional development. Discussed work-life balance, stress management techniques, and maintaining professional boundaries. Explored strategies for preventing burnout and maintaining personal well-being while supporting clients effectively.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 5 DAY),

(@therapist2_id, 'Dr. Lisa Chen', 'TEACHING_SESSION', 'Teacher', 'EMDR Certified Trainer',
 NOW() - INTERVAL 12 DAY, 180, 300.00, 'EMDR certification training session', 'Teaching session on specialized therapeutic approaches for EMDR therapy. Enhanced skills in trauma-informed care and evidence-based practices. Learned advanced EMDR techniques and case conceptualization strategies for complex trauma cases.', 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 18 DAY, TRUE, NOW() - INTERVAL 12 DAY),

(@therapist2_id, 'Dr. James Wilson', 'SUPERVISION', 'Supervisor', 'Addiction Treatment Specialist',
 NOW() - INTERVAL 19 DAY, 90, 180.00, 'Addiction treatment supervision', 'Supervision session covering addiction treatment cases and ethical considerations. Reviewed treatment plans for substance abuse clients, discussed relapse prevention strategies, and explored family therapy approaches in addiction treatment.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 19 DAY),

(@therapist2_id, 'Dr. Lisa Chen', 'TEACHING_SESSION', 'Teacher', 'EMDR Certified Trainer',
 NOW() + INTERVAL 18 DAY, 180, 300.00, 'Advanced EMDR techniques workshop', 'Scheduled teaching session on advanced EMDR techniques and case conceptualization. Will cover complex trauma cases, group EMDR protocols, and integration with other therapeutic modalities.', 'SCHEDULED', FALSE, TRUE, 'MONTHLY', NOW() + INTERVAL 36 DAY, TRUE, NOW());

-- Therapist 3 - Skill Development Sessions
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist3_id, 'Dr. Rachel Green', 'PERSONAL_THERAPY', 'Therapist', 'Child and Adolescent Specialist',
 NOW() - INTERVAL 3 DAY, 60, 130.00, 'Personal therapy for child therapist', 'Personal therapy session focusing on therapist self-care and professional development. Discussed work-life balance, stress management techniques, and maintaining professional boundaries. Explored strategies for preventing burnout and maintaining personal well-being while supporting clients effectively.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 3 DAY),

(@therapist3_id, 'Dr. Maria Rodriguez', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Play Therapy Expert',
 NOW() - INTERVAL 10 DAY, 120, 220.00, 'Advanced play therapy techniques', 'Professional development workshop on advanced play therapy techniques and child psychology. Learned new intervention strategies, assessment tools, and evidence-based practices for working with children and families. Enhanced skills in play therapy and family therapy approaches.', 'COMPLETED', TRUE, TRUE, 'QUARTERLY', NOW() + INTERVAL 65 DAY, TRUE, NOW() - INTERVAL 10 DAY),

(@therapist3_id, 'Dr. Robert Kim', 'SUPERVISION', 'Supervisor', 'Family Therapy Specialist',
 NOW() - INTERVAL 17 DAY, 90, 170.00, 'Family therapy supervision', 'Supervision session covering family therapy cases and ethical considerations. Reviewed treatment plans for family clients, discussed systemic approaches, and explored family dynamics and communication patterns.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 17 DAY),

(@therapist3_id, 'Dr. Maria Rodriguez', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Play Therapy Expert',
 NOW() + INTERVAL 65 DAY, 120, 220.00, 'Advanced play therapy workshop', 'Scheduled professional development workshop on advanced play therapy techniques. Will cover specialized play therapy approaches, family play therapy, and integration with other child therapy modalities.', 'SCHEDULED', FALSE, TRUE, 'QUARTERLY', NOW() + INTERVAL 130 DAY, TRUE, NOW());

-- Guide Sessions (should create automatic expenses)
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist1_id, 'Dr. Elena Guide', 'PERSONAL_THERAPY', 'Guide', 'Spiritual Wellness Coach',
 NOW() - INTERVAL 2 DAY, 90, 180.00, 'Spiritual wellness coaching session', 'Spiritual wellness coaching session focusing on personal growth and spiritual development. Explored mindfulness practices, meditation techniques, and spiritual self-care strategies. Enhanced personal well-being and spiritual connection.', 'COMPLETED', TRUE, TRUE, 'WEEKLY', NOW() + INTERVAL 5 DAY, TRUE, NOW() - INTERVAL 2 DAY),

(@therapist2_id, 'Dr. Carlos Guide', 'MINDFULNESS_SESSION', 'Guide', 'Meditation and Mindfulness Expert',
 NOW() - INTERVAL 9 DAY, 60, 160.00, 'Mindfulness and meditation training', 'Mindfulness and meditation training session focusing on stress reduction and mental clarity. Learned advanced meditation techniques, breathing exercises, and mindfulness practices for personal and professional use.', 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 21 DAY, TRUE, NOW() - INTERVAL 9 DAY),

(@therapist3_id, 'Dr. Aisha Guide', 'WELLNESS_COACHING', 'Guide', 'Holistic Health Practitioner',
 NOW() - INTERVAL 16 DAY, 120, 200.00, 'Holistic wellness coaching', 'Holistic wellness coaching session covering physical, mental, and spiritual well-being. Explored nutrition, exercise, stress management, and lifestyle balance strategies for optimal health and wellness.', 'COMPLETED', TRUE, TRUE, 'QUARTERLY', NOW() + INTERVAL 74 DAY, TRUE, NOW() - INTERVAL 16 DAY);

-- ADDITIONAL PERSONAL MEETINGS FOR ALL THERAPISTS
-- ===============================================

-- Therapist 6 - Addiction Specialist Personal Development
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist6_id, 'Dr. Jonathan Weiss', 'PERSONAL_THERAPY', 'Therapist', 'Addiction Specialist',
 NOW() - INTERVAL 5 DAY, 60, 160.00, 'Personal therapy for addiction specialist', 'Personal therapy session focusing on therapist self-care and professional development. Discussed work-life balance, stress management techniques, and maintaining professional boundaries. Explored strategies for preventing burnout and maintaining personal well-being while supporting clients effectively.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 5 DAY),

(@therapist6_id, 'Dr. Sarah Mitchell', 'SUPERVISION', 'Supervisor', 'Senior Addiction Counselor',
 NOW() - INTERVAL 12 DAY, 90, 200.00, 'Addiction treatment supervision', 'Supervision session covering addiction treatment cases and ethical considerations. Reviewed treatment plans for substance abuse clients, discussed relapse prevention strategies, and explored family therapy approaches in addiction treatment.', 'COMPLETED', TRUE, TRUE, 'WEEKLY', NOW() + INTERVAL 2 DAY, TRUE, NOW() - INTERVAL 12 DAY),

(@therapist6_id, 'Dr. Robert Chen', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Substance Abuse Expert',
 NOW() - INTERVAL 19 DAY, 120, 250.00, 'Advanced addiction treatment training', 'Professional development workshop on advanced addiction treatment techniques and evidence-based practices. Learned new intervention strategies, assessment tools, and specialized approaches for substance abuse treatment.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 19 DAY),

(@therapist6_id, 'Dr. Sarah Mitchell', 'SUPERVISION', 'Supervisor', 'Senior Addiction Counselor',
 NOW() + INTERVAL 2 DAY, 90, 200.00, 'Upcoming addiction supervision', 'Scheduled supervision session to review ongoing addiction treatment cases and professional development goals. Will discuss recent client progress, ethical dilemmas, and continuing education opportunities.', 'SCHEDULED', FALSE, TRUE, 'WEEKLY', NOW() + INTERVAL 9 DAY, TRUE, NOW());

-- Therapist 7 - Child Psychology Personal Development
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist7_id, 'Dr. Miriam Goldstein', 'PERSONAL_THERAPY', 'Therapist', 'Child Psychology Specialist',
 NOW() - INTERVAL 3 DAY, 60, 140.00, 'Personal therapy for child psychologist', 'Personal therapy session focusing on therapist self-care and professional development. Discussed work-life balance, stress management techniques, and maintaining professional boundaries. Explored strategies for preventing burnout and maintaining personal well-being while supporting clients effectively.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 3 DAY),

(@therapist7_id, 'Dr. Lisa Rodriguez', 'TEACHING_SESSION', 'Teacher', 'Play Therapy Certified Trainer',
 NOW() - INTERVAL 10 DAY, 180, 300.00, 'Advanced play therapy training', 'Teaching session on specialized therapeutic approaches for play therapy. Enhanced skills in trauma-informed care and evidence-based practices for working with children. Learned advanced play therapy techniques and case conceptualization strategies.', 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 20 DAY, TRUE, NOW() - INTERVAL 10 DAY),

(@therapist7_id, 'Dr. James Wilson', 'SUPERVISION', 'Supervisor', 'Child Development Expert',
 NOW() - INTERVAL 17 DAY, 90, 180.00, 'Child psychology supervision', 'Supervision session covering child psychology cases and ethical considerations. Reviewed treatment plans for child clients, discussed developmental approaches, and explored family dynamics and child development patterns.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 17 DAY),

(@therapist7_id, 'Dr. Lisa Rodriguez', 'TEACHING_SESSION', 'Teacher', 'Play Therapy Certified Trainer',
 NOW() + INTERVAL 20 DAY, 180, 300.00, 'Advanced play therapy workshop', 'Scheduled teaching session on advanced play therapy techniques and case conceptualization. Will cover specialized play therapy approaches, family play therapy, and integration with other child therapy modalities.', 'SCHEDULED', FALSE, TRUE, 'MONTHLY', NOW() + INTERVAL 50 DAY, TRUE, NOW());

-- Therapist 8 - Geriatric Psychology Personal Development
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist8_id, 'Dr. Aaron Cohen', 'PERSONAL_THERAPY', 'Therapist', 'Geriatric Psychology Specialist',
 NOW() - INTERVAL 4 DAY, 60, 150.00, 'Personal therapy for geriatric psychologist', 'Personal therapy session focusing on therapist self-care and professional development. Discussed work-life balance, stress management techniques, and maintaining professional boundaries. Explored strategies for preventing burnout and maintaining personal well-being while supporting clients effectively.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 4 DAY),

(@therapist8_id, 'Dr. Maria Johnson', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Elder Care Expert',
 NOW() - INTERVAL 11 DAY, 120, 230.00, 'Advanced geriatric care training', 'Professional development workshop on advanced geriatric psychology techniques and elder care practices. Learned new intervention strategies, assessment tools, and evidence-based practices for working with elderly clients and their families.', 'COMPLETED', TRUE, TRUE, 'QUARTERLY', NOW() + INTERVAL 70 DAY, TRUE, NOW() - INTERVAL 11 DAY),

(@therapist8_id, 'Dr. Robert Kim', 'SUPERVISION', 'Supervisor', 'Geriatric Therapy Specialist',
 NOW() - INTERVAL 18 DAY, 90, 190.00, 'Geriatric psychology supervision', 'Supervision session covering geriatric psychology cases and ethical considerations. Reviewed treatment plans for elderly clients, discussed age-related approaches, and explored family dynamics and elder care patterns.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 18 DAY),

(@therapist8_id, 'Dr. Maria Johnson', 'PROFESSIONAL_DEVELOPMENT', 'Mentor', 'Elder Care Expert',
 NOW() + INTERVAL 70 DAY, 120, 230.00, 'Advanced geriatric care workshop', 'Scheduled professional development workshop on advanced geriatric psychology techniques. Will cover specialized elder care approaches, family therapy for elderly, and integration with other geriatric therapy modalities.', 'SCHEDULED', FALSE, TRUE, 'QUARTERLY', NOW() + INTERVAL 140 DAY, TRUE, NOW());

-- Therapist 9 - Sports Psychology Personal Development
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist9_id, 'Dr. Rebecca Stern', 'PERSONAL_THERAPY', 'Therapist', 'Sports Psychology Specialist',
 NOW() - INTERVAL 6 DAY, 60, 170.00, 'Personal therapy for sports psychologist', 'Personal therapy session focusing on therapist self-care and professional development. Discussed work-life balance, stress management techniques, and maintaining professional boundaries. Explored strategies for preventing burnout and maintaining personal well-being while supporting clients effectively.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 6 DAY),

(@therapist9_id, 'Dr. David Wilson', 'TEACHING_SESSION', 'Teacher', 'Performance Psychology Trainer',
 NOW() - INTERVAL 13 DAY, 180, 350.00, 'Advanced performance psychology training', 'Teaching session on specialized therapeutic approaches for sports psychology and performance enhancement. Enhanced skills in performance psychology, mental training techniques, and evidence-based practices for working with athletes and performers.', 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 17 DAY, TRUE, NOW() - INTERVAL 13 DAY),

(@therapist9_id, 'Dr. Sarah Chen', 'SUPERVISION', 'Supervisor', 'Athletic Performance Expert',
 NOW() - INTERVAL 20 DAY, 90, 210.00, 'Sports psychology supervision', 'Supervision session covering sports psychology cases and ethical considerations. Reviewed treatment plans for athlete clients, discussed performance enhancement approaches, and explored mental training and psychological preparation strategies.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 20 DAY),

(@therapist9_id, 'Dr. David Wilson', 'TEACHING_SESSION', 'Teacher', 'Performance Psychology Trainer',
 NOW() + INTERVAL 17 DAY, 180, 350.00, 'Advanced performance psychology workshop', 'Scheduled teaching session on advanced performance psychology techniques and case conceptualization. Will cover specialized sports psychology approaches, mental training protocols, and integration with other performance enhancement modalities.', 'SCHEDULED', FALSE, TRUE, 'MONTHLY', NOW() + INTERVAL 47 DAY, TRUE, NOW());

-- Therapist 10 - Corporate Psychology Personal Development
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist10_id, 'Dr. Daniel Friedman', 'PERSONAL_THERAPY', 'Therapist', 'Corporate Psychology Specialist',
 NOW() - INTERVAL 2 DAY, 60, 180.00, 'Personal therapy for corporate psychologist', 'Personal therapy session focusing on therapist self-care and professional development. Discussed work-life balance, stress management techniques, and maintaining professional boundaries. Explored strategies for preventing burnout and maintaining personal well-being while supporting clients effectively.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 2 DAY),

(@therapist10_id, 'Dr. Jennifer Park', 'TEACHING_SESSION', 'Teacher', 'Executive Coaching Trainer',
 NOW() - INTERVAL 9 DAY, 180, 400.00, 'Advanced executive coaching training', 'Teaching session on specialized therapeutic approaches for corporate psychology and executive coaching. Enhanced skills in organizational psychology, leadership development, and evidence-based practices for working with executives and corporate clients.', 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 21 DAY, TRUE, NOW() - INTERVAL 9 DAY),

(@therapist10_id, 'Dr. Michael Brown', 'SUPERVISION', 'Supervisor', 'Organizational Psychology Expert',
 NOW() - INTERVAL 16 DAY, 90, 220.00, 'Corporate psychology supervision', 'Supervision session covering corporate psychology cases and ethical considerations. Reviewed treatment plans for executive clients, discussed organizational approaches, and explored workplace dynamics and corporate culture patterns.', 'COMPLETED', TRUE, FALSE, NULL, NULL, TRUE, NOW() - INTERVAL 16 DAY),

(@therapist10_id, 'Dr. Jennifer Park', 'TEACHING_SESSION', 'Teacher', 'Executive Coaching Trainer',
 NOW() + INTERVAL 21 DAY, 180, 400.00, 'Advanced executive coaching workshop', 'Scheduled teaching session on advanced executive coaching techniques and case conceptualization. Will cover specialized corporate psychology approaches, leadership development protocols, and integration with other organizational enhancement modalities.', 'SCHEDULED', FALSE, TRUE, 'MONTHLY', NOW() + INTERVAL 51 DAY, TRUE, NOW());

-- Additional Guide Sessions for all therapists (creates automatic expenses)
INSERT INTO personal_meetings (
        user_id, therapist_name, meeting_type, provider_type, provider_credentials,
        meeting_date, duration, price, notes, summary, status, is_paid, is_recurring, 
        recurrence_frequency, next_due_date, is_active, created_at)
VALUES 
(@therapist6_id, 'Dr. Elena Guide', 'PERSONAL_THERAPY', 'Guide', 'Addiction Recovery Coach',
 NOW() - INTERVAL 1 DAY, 90, 190.00, 'Addiction recovery coaching session', 'Addiction recovery coaching session focusing on personal growth and recovery support. Explored mindfulness practices, recovery strategies, and spiritual self-care approaches. Enhanced personal well-being and recovery connection.', 'COMPLETED', TRUE, TRUE, 'WEEKLY', NOW() + INTERVAL 6 DAY, TRUE, NOW() - INTERVAL 1 DAY),

(@therapist7_id, 'Dr. Carlos Guide', 'MINDFULNESS_SESSION', 'Guide', 'Child Mindfulness Expert',
 NOW() - INTERVAL 8 DAY, 60, 170.00, 'Child mindfulness training session', 'Child mindfulness training session focusing on stress reduction and mental clarity for working with children. Learned advanced meditation techniques, breathing exercises, and mindfulness practices for child therapy applications.', 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 22 DAY, TRUE, NOW() - INTERVAL 8 DAY),

(@therapist8_id, 'Dr. Aisha Guide', 'WELLNESS_COACHING', 'Guide', 'Elder Wellness Practitioner',
 NOW() - INTERVAL 15 DAY, 120, 210.00, 'Elder wellness coaching session', 'Elder wellness coaching session covering physical, mental, and spiritual well-being for working with elderly clients. Explored nutrition, exercise, stress management, and lifestyle balance strategies for optimal elder care.', 'COMPLETED', TRUE, TRUE, 'QUARTERLY', NOW() + INTERVAL 75 DAY, TRUE, NOW() - INTERVAL 15 DAY),

(@therapist9_id, 'Dr. Marcus Guide', 'PERFORMANCE_COACHING', 'Guide', 'Athletic Performance Coach',
 NOW() - INTERVAL 7 DAY, 90, 240.00, 'Athletic performance coaching session', 'Athletic performance coaching session focusing on personal growth and performance enhancement. Explored mindfulness practices, performance techniques, and athletic self-care strategies. Enhanced personal well-being and performance connection.', 'COMPLETED', TRUE, TRUE, 'WEEKLY', NOW() + INTERVAL 3 DAY, TRUE, NOW() - INTERVAL 7 DAY),

(@therapist10_id, 'Dr. Sophia Guide', 'EXECUTIVE_COACHING', 'Guide', 'Corporate Wellness Expert',
 NOW() - INTERVAL 14 DAY, 120, 280.00, 'Corporate wellness coaching session', 'Corporate wellness coaching session covering physical, mental, and spiritual well-being for working with corporate clients. Explored nutrition, exercise, stress management, and lifestyle balance strategies for optimal corporate wellness.', 'COMPLETED', TRUE, TRUE, 'MONTHLY', NOW() + INTERVAL 16 DAY, TRUE, NOW() - INTERVAL 14 DAY);

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

-- ADDITIONAL EXPENSES FOR NEW THERAPISTS
-- ======================================

-- Therapist 6 - Addiction Specialist Expenses
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Equipment & Supplies
(@therapist6_id, 'Addiction Assessment Tools', 'Professional addiction assessment kits', 1200.00, 'ILS', 'Supplies & Equipment', 'Assessment tools for addiction treatment', NOW() - INTERVAL 25 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),
(@therapist6_id, 'Group Therapy Materials', 'Materials for group therapy sessions', 400.00, 'ILS', 'Supplies & Equipment', 'Group therapy supplies and materials', NOW() - INTERVAL 15 DAY, FALSE, NULL, NULL, TRUE, 'Cash', TRUE, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),

-- Professional Development
(@therapist6_id, 'Addiction Counseling Certification', 'Advanced addiction counseling training', 3000.00, 'ILS', 'Professional Development', 'Certification for addiction treatment', NOW() - INTERVAL 60 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 60 DAY),
(@therapist6_id, '12-Step Program Training', '12-step program integration training', 800.00, 'ILS', 'Professional Development', '12-step program training', NOW() - INTERVAL 45 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY),

-- Office & Rent
(@therapist6_id, 'Recovery Center Office', 'Office space in recovery center', 2800.00, 'ILS', 'Office & Rent', 'Monthly rent for recovery center office', NOW() - INTERVAL 30 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 5 DAY, TRUE, 'Bank Transfer', TRUE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(@therapist6_id, 'Office Security System', 'Security system for sensitive client data', 1500.00, 'ILS', 'Supplies & Equipment', 'Security system installation', NOW() - INTERVAL 50 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 50 DAY);

-- Therapist 7 - Child Psychology Expenses
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Child Therapy Equipment
(@therapist7_id, 'Play Therapy Equipment', 'Complete play therapy kit and toys', 800.00, 'ILS', 'Supplies & Equipment', 'Play therapy materials and equipment', NOW() - INTERVAL 35 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 35 DAY),
(@therapist7_id, 'Art Therapy Supplies', 'Art therapy materials and supplies', 300.00, 'ILS', 'Supplies & Equipment', 'Art therapy materials', NOW() - INTERVAL 25 DAY, FALSE, NULL, NULL, TRUE, 'Cash', TRUE, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),
(@therapist7_id, 'Sand Tray Therapy Kit', 'Sand tray therapy equipment', 600.00, 'ILS', 'Supplies & Equipment', 'Sand tray therapy kit', NOW() - INTERVAL 40 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 40 DAY),

-- Professional Development
(@therapist7_id, 'Child Psychology Certification', 'Specialized child psychology training', 2200.00, 'ILS', 'Professional Development', 'Child psychology certification', NOW() - INTERVAL 70 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 70 DAY, NOW() - INTERVAL 70 DAY),
(@therapist7_id, 'Play Therapy Workshop', 'Play therapy techniques workshop', 900.00, 'ILS', 'Professional Development', 'Play therapy training', NOW() - INTERVAL 55 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 55 DAY, NOW() - INTERVAL 55 DAY),

-- Office & Rent
(@therapist7_id, 'Child-Friendly Office Setup', 'Child-friendly office furniture and decor', 1800.00, 'ILS', 'Office & Rent', 'Child-friendly office setup', NOW() - INTERVAL 45 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY),
(@therapist7_id, 'Office Rent', 'Monthly office rental', 2500.00, 'ILS', 'Office & Rent', 'Monthly office rent', NOW() - INTERVAL 10 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 20 DAY, FALSE, 'Bank Transfer', TRUE, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY);

-- Therapist 8 - Geriatric Psychology Expenses
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Geriatric Equipment
(@therapist8_id, 'Geriatric Assessment Tools', 'Assessment tools for elderly clients', 700.00, 'ILS', 'Supplies & Equipment', 'Geriatric assessment tools', NOW() - INTERVAL 30 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(@therapist8_id, 'Memory Enhancement Materials', 'Memory enhancement therapy materials', 400.00, 'ILS', 'Supplies & Equipment', 'Memory enhancement materials', NOW() - INTERVAL 20 DAY, FALSE, NULL, NULL, TRUE, 'Cash', TRUE, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY),

-- Professional Development
(@therapist8_id, 'Geriatric Psychology Certification', 'Specialized geriatric psychology training', 1800.00, 'ILS', 'Professional Development', 'Geriatric psychology certification', NOW() - INTERVAL 65 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 65 DAY, NOW() - INTERVAL 65 DAY),
(@therapist8_id, 'Dementia Care Workshop', 'Dementia care techniques workshop', 600.00, 'ILS', 'Professional Development', 'Dementia care training', NOW() - INTERVAL 50 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 50 DAY),

-- Office & Rent
(@therapist8_id, 'Accessible Office Setup', 'Accessible office furniture and equipment', 1200.00, 'ILS', 'Office & Rent', 'Accessible office setup', NOW() - INTERVAL 40 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 40 DAY),
(@therapist8_id, 'Office Rent', 'Monthly office rental', 2200.00, 'ILS', 'Office & Rent', 'Monthly office rent', NOW() - INTERVAL 8 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 22 DAY, FALSE, 'Bank Transfer', TRUE, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY);

-- Therapist 9 - Sports Psychology Expenses
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Sports Psychology Equipment
(@therapist9_id, 'Performance Monitoring Equipment', 'Equipment for performance monitoring', 2500.00, 'ILS', 'Supplies & Equipment', 'Performance monitoring equipment', NOW() - INTERVAL 35 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 35 DAY),
(@therapist9_id, 'Biofeedback Equipment', 'Biofeedback therapy equipment', 1800.00, 'ILS', 'Supplies & Equipment', 'Biofeedback equipment', NOW() - INTERVAL 25 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),

-- Professional Development
(@therapist9_id, 'Sports Psychology Certification', 'Specialized sports psychology training', 2800.00, 'ILS', 'Professional Development', 'Sports psychology certification', NOW() - INTERVAL 75 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 75 DAY, NOW() - INTERVAL 75 DAY),
(@therapist9_id, 'Performance Psychology Workshop', 'Performance psychology techniques workshop', 1200.00, 'ILS', 'Professional Development', 'Performance psychology training', NOW() - INTERVAL 60 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 60 DAY),

-- Office & Rent
(@therapist9_id, 'Sports Psychology Office', 'Office space near sports facilities', 3200.00, 'ILS', 'Office & Rent', 'Monthly rent for sports psychology office', NOW() - INTERVAL 30 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 5 DAY, TRUE, 'Bank Transfer', TRUE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(@therapist9_id, 'Office Equipment', 'Office equipment for sports psychology', 900.00, 'ILS', 'Supplies & Equipment', 'Office equipment', NOW() - INTERVAL 15 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY);

-- Therapist 10 - Corporate Psychology Expenses
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Corporate Psychology Equipment
(@therapist10_id, 'Executive Coaching Materials', 'Materials for executive coaching', 800.00, 'ILS', 'Supplies & Equipment', 'Executive coaching materials', NOW() - INTERVAL 30 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(@therapist10_id, 'Assessment Tools', 'Corporate assessment tools and materials', 600.00, 'ILS', 'Supplies & Equipment', 'Corporate assessment tools', NOW() - INTERVAL 20 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY),

-- Professional Development
(@therapist10_id, 'Corporate Psychology Certification', 'Specialized corporate psychology training', 3500.00, 'ILS', 'Professional Development', 'Corporate psychology certification', NOW() - INTERVAL 80 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 80 DAY, NOW() - INTERVAL 80 DAY),
(@therapist10_id, 'Executive Coaching Workshop', 'Executive coaching techniques workshop', 1500.00, 'ILS', 'Professional Development', 'Executive coaching training', NOW() - INTERVAL 65 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 65 DAY, NOW() - INTERVAL 65 DAY),

-- Office & Rent
(@therapist10_id, 'Corporate Office Space', 'Premium office space in business district', 4500.00, 'ILS', 'Office & Rent', 'Monthly rent for corporate office', NOW() - INTERVAL 30 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 5 DAY, TRUE, 'Bank Transfer', TRUE, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(@therapist10_id, 'Conference Room Setup', 'Conference room for group sessions', 2000.00, 'ILS', 'Office & Rent', 'Conference room setup', NOW() - INTERVAL 45 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY);

-- Additional varied expenses for testing different scenarios
INSERT INTO expenses (user_id, name, description, amount, currency, category, notes, expense_date, is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method, is_active, created_at, updated_at)
VALUES
-- Recurring expenses for new therapists
(@therapist6_id, 'Monthly Recovery Materials', 'Monthly recovery materials and supplies', 150.00, 'ILS', 'Other', 'Monthly recovery materials', NOW() - INTERVAL 5 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 25 DAY, FALSE, 'Cash', TRUE, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
(@therapist7_id, 'Quarterly Child Therapy Journal', 'Quarterly child therapy journal subscription', 120.00, 'ILS', 'Professional Development', 'Child therapy journal subscription', NOW() - INTERVAL 10 DAY, TRUE, 'QUARTERLY', NOW() + INTERVAL 80 DAY, FALSE, 'Credit Card', TRUE, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),
(@therapist8_id, 'Annual Geriatric Association', 'Annual geriatric psychology association membership', 250.00, 'ILS', 'Professional Development', 'Geriatric association fees', NOW() - INTERVAL 85 DAY, TRUE, 'YEARLY', NOW() + INTERVAL 280 DAY, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 85 DAY, NOW() - INTERVAL 85 DAY),
(@therapist9_id, 'Monthly Sports Psychology Journal', 'Monthly sports psychology journal subscription', 180.00, 'ILS', 'Professional Development', 'Sports psychology journal subscription', NOW() - INTERVAL 12 DAY, TRUE, 'MONTHLY', NOW() + INTERVAL 18 DAY, FALSE, 'Credit Card', TRUE, NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 12 DAY),
(@therapist10_id, 'Quarterly Corporate Psychology Journal', 'Quarterly corporate psychology journal subscription', 200.00, 'ILS', 'Professional Development', 'Corporate psychology journal subscription', NOW() - INTERVAL 8 DAY, TRUE, 'QUARTERLY', NOW() + INTERVAL 82 DAY, FALSE, 'Credit Card', TRUE, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),

-- Large one-time expenses for new therapists
(@therapist6_id, 'New Addiction Treatment Center', 'New addiction treatment center setup', 15000.00, 'ILS', 'Supplies & Equipment', 'Addiction treatment center setup', NOW() - INTERVAL 120 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 120 DAY, NOW() - INTERVAL 120 DAY),
(@therapist7_id, 'Child Therapy Playground', 'Outdoor playground for child therapy', 8000.00, 'ILS', 'Supplies & Equipment', 'Child therapy playground', NOW() - INTERVAL 110 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 110 DAY, NOW() - INTERVAL 110 DAY),
(@therapist8_id, 'Geriatric Therapy Garden', 'Therapeutic garden for elderly clients', 6000.00, 'ILS', 'Supplies & Equipment', 'Geriatric therapy garden', NOW() - INTERVAL 100 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 100 DAY, NOW() - INTERVAL 100 DAY),
(@therapist9_id, 'Sports Psychology Gym', 'Gym equipment for sports psychology', 12000.00, 'ILS', 'Supplies & Equipment', 'Sports psychology gym setup', NOW() - INTERVAL 130 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 130 DAY, NOW() - INTERVAL 130 DAY),
(@therapist10_id, 'Corporate Conference Center', 'Conference center for corporate psychology', 20000.00, 'ILS', 'Supplies & Equipment', 'Corporate conference center setup', NOW() - INTERVAL 140 DAY, FALSE, NULL, NULL, TRUE, 'Credit Card', TRUE, NOW() - INTERVAL 140 DAY, NOW() - INTERVAL 140 DAY),

-- Unpaid expenses for testing
(@therapist6_id, 'Pending Addiction Conference', 'Pending addiction conference registration', 600.00, 'ILS', 'Professional Development', 'Addiction conference registration', NOW() - INTERVAL 2 DAY, FALSE, NULL, NULL, FALSE, NULL, TRUE, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
(@therapist7_id, 'Unpaid Child Therapy Workshop', 'Upcoming child therapy workshop', 400.00, 'ILS', 'Professional Development', 'Child therapy workshop registration', NOW() - INTERVAL 1 DAY, FALSE, NULL, NULL, FALSE, NULL, TRUE, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
(@therapist8_id, 'Pending Geriatric Conference', 'Pending geriatric psychology conference', 500.00, 'ILS', 'Professional Development', 'Geriatric conference registration', NOW() - INTERVAL 3 DAY, FALSE, NULL, NULL, FALSE, NULL, TRUE, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
(@therapist9_id, 'Unpaid Sports Psychology Seminar', 'Upcoming sports psychology seminar', 700.00, 'ILS', 'Professional Development', 'Sports psychology seminar registration', NOW() - INTERVAL 1 DAY, FALSE, NULL, NULL, FALSE, NULL, TRUE, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
(@therapist10_id, 'Pending Corporate Conference', 'Pending corporate psychology conference', 900.00, 'ILS', 'Professional Development', 'Corporate conference registration', NOW() - INTERVAL 2 DAY, FALSE, NULL, NULL, FALSE, NULL, TRUE, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY);

-- 7. MASSIVE Summary Statistics for Comprehensive Testing
-- ======================================================
-- This section provides a summary of the MASSIVE data created for comprehensive testing

-- Total Users: 12 (10 therapists + 2 admins)
-- Total Clients: 82+ (comprehensive client base across all therapists)
-- Total Meetings: 200+ (extensive sessions with multiple sessions per day)
-- Total Personal Meetings: 50+ (diverse personal development sessions)
-- Total Expenses: 80+ (comprehensive expense categories and scenarios)

-- Data includes:
-- ✅ 10 therapists with different specializations:
--    - Therapist 1: High Volume Practice (12 clients)
--    - Therapist 2: Specialized Practice (10 clients)
--    - Therapist 3: Child & Family Practice (10 clients)
--    - Therapist 4: Trauma Specialist (8 clients)
--    - Therapist 5: Couples & Family Specialist (8 clients)
--    - Therapist 6: Addiction Specialist (8 clients)
--    - Therapist 7: Child Psychology Specialist (10 clients)
--    - Therapist 8: Geriatric Psychology (6 clients)
--    - Therapist 9: Sports Psychology (8 clients)
--    - Therapist 10: Corporate Psychology (10 clients)

-- ✅ Comprehensive client profiles with realistic notes and diverse backgrounds
-- ✅ Extensive meeting scenarios:
--    - Multiple sessions per day (up to 10 sessions per therapist per day)
--    - Overlapping schedules and time conflicts
--    - Varied meeting types (completed, scheduled, cancelled, no-show)
--    - Different session durations (30-180 minutes)
--    - Diverse pricing structures ($120-$400 per session)
--    - Realistic session notes and descriptions

-- ✅ Personal meetings with diverse provider types:
--    - Personal therapy sessions
--    - Supervision sessions
--    - Professional development workshops
--    - Teaching sessions
--    - Guide sessions (creates automatic expenses)
--    - Recurring and one-time sessions

-- ✅ Comprehensive expense categories:
--    - Office & Rent expenses
--    - Professional Development
--    - Supplies & Equipment
--    - Insurance & Liability
--    - Marketing & Advertising
--    - Software & Tools
--    - Utilities
--    - Other miscellaneous expenses

-- ✅ Diverse expense scenarios:
--    - Recurring expenses (monthly, quarterly, yearly)
--    - One-time large purchases
--    - Paid and unpaid items for testing payment toggles
--    - Different payment methods (Credit Card, Bank Transfer, Cash)
--    - Realistic expense amounts ($150-$20,000)
--    - Specialized equipment for each therapist type

-- ✅ Testing scenarios covered:
--    - Multiple sessions per day scheduling
--    - Overlapping appointment times
--    - Different therapist specializations
--    - Various client demographics and needs
--    - Comprehensive expense tracking
--    - Personal development tracking
--    - Guide session automatic expense creation
--    - Payment status management
--    - Recurring vs one-time expenses
--    - Different currency handling (ILS)

-- ✅ Realistic data patterns:
--    - Historical data with proper date intervals
--    - Future scheduled sessions
--    - Varied session durations and pricing
--    - Comprehensive client notes and descriptions
--    - Professional credentialing information
--    - Realistic expense descriptions and categories

-- -----------------------------------------------------------------------
-- End of ULTRA-ENRICHED seed script
-- ----------------------------------------------------------------------- 