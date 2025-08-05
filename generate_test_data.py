#!/usr/bin/env python3
"""
Clinic Management System - Test Data Generator
Generates comprehensive test data including edge cases for testing the clinic management system.
"""

import mysql.connector
import random
import string
import datetime
import time
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': 'sunbit-mysql',
    'port': 30306,
    'user': 'root',
    'password': 'root',
    'database': 'my_clinic',
    'charset': 'utf8mb4',
    'use_unicode': True,
    'autocommit': True
}

# Test data configuration - Production-like environment
CONFIG = {
    'num_users': 50,                    # Multiple therapists and admins
    'num_clients_per_user': 25,         # Realistic client load per therapist
    'num_meetings_per_client': 30,      # Multiple sessions per client
    'num_personal_meetings_per_user': 15, # Regular personal development
    'num_expenses_per_user': 50,        # Comprehensive expense tracking
    'date_range_days': 365,             # Full year of data
    'include_edge_cases': True,
    'production_simulation': True        # Enable production-like scenarios
}

# Edge case data
EDGE_CASES = {
    'names': [
        "אלכסנדר-מרטין ג'ונסון-סמית'",  # Hebrew + English with special chars
        "Dr. María José González-López",  # Spanish with accents
        "Jean-Pierre O'Connor-Müller",    # French-German hybrid
        "محمد علي أحمد",                   # Arabic
        "李小明",                          # Chinese
        "A" * 254,                       # Very long name
        "",                              # Empty name (should be handled)
        "   ",                          # Whitespace only
        "NULL",                         # Literal NULL string
        "Test'User",                    # SQL injection attempt
        "Test\"User",                   # Double quotes
        "Test\\User",                   # Backslash
    ],
    'emails': [
        "test@example.com",
        "test+tag@example.com",
        "test.user@subdomain.example.co.uk",
        "test@localhost",
        "test@[127.0.0.1]",
        "test@domain-with-dash.com",
        "test@domain_with_underscore.com",
        "test@domain.with.multiple.dots.com",
        "test@domain.com.",
        "test@.domain.com",
        "@domain.com",
        "test@",
        "test@domain",
        "test.domain.com",
        "test@domain..com",
        "test@domain.com@domain.com",
        "test@@domain.com",
        "test@domain@domain.com",
        "test@domain.com@",
        "test@domain.com@domain.com@domain.com",
    ],
    'phones': [
        "050-123-4567",
        "0501234567",
        "+972-50-123-4567",
        "+972501234567",
        "050 123 4567",
        "050.123.4567",
        "(050) 123-4567",
        "050-123-4567 ext 123",
        "050-123-4567 x123",
        "050-123-4567 ext. 123",
        "050-123-4567 extension 123",
        "050-123-4567 ext123",
        "050-123-4567 ext.123",
        "050-123-4567 ext. 123",
        "050-123-4567 ext. 123",
        "050-123-4567 ext. 123",
        "050-123-4567 ext. 123",
        "050-123-4567 ext. 123",
        "050-123-4567 ext. 123",
        "050-123-4567 ext. 123",
        "050-123-4567 ext. 123",
    ]
}

class TestDataGenerator:
    def __init__(self):
        self.connection = None
        self.cursor = None
        self.user_ids = []
        self.client_ids = []
        self.client_source_ids = []
        self.payment_type_ids = []
        self.personal_meeting_type_ids = []
        
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(**DB_CONFIG)
            self.cursor = self.connection.cursor()
            logger.info("Successfully connected to database")
        except mysql.connector.Error as err:
            logger.error(f"Error connecting to database: {err}")
            raise
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logger.info("Database connection closed")
    
    def random_string(self, length=10, include_special=True):
        """Generate random string"""
        chars = string.ascii_letters + string.digits
        if include_special:
            chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"
        return ''.join(random.choices(chars, k=length))
    
    def random_date(self, start_date, end_date):
        """Generate random date between start and end"""
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        random_seconds = random.randrange(86400)
        return start_date + datetime.timedelta(days=random_days, seconds=random_seconds)
    
    def random_time_slot(self, date):
        """Generate random time slot for a given date"""
        hour = random.randint(8, 19)  # 8 AM to 7 PM
        minute = random.choice([0, 15, 30, 45])
        return datetime.datetime.combine(date, datetime.time(hour, minute))
    
    def get_edge_case_or_random(self, edge_cases, default_func):
        """Get edge case with probability or random value"""
        if CONFIG['include_edge_cases'] and random.random() < 0.1:  # 10% chance for edge case
            return random.choice(edge_cases)
        return default_func()
    
    def generate_users(self):
        """Generate production-like users with realistic distribution"""
        logger.info("Generating users...")
        
        # Production-like user distribution
        therapist_names = [
            "Dr. Sarah Cohen", "Dr. Michael Levy", "Dr. Rachel Green", "Dr. David Rosenberg",
            "Dr. Miriam Schwartz", "Dr. Jonathan Weiss", "Dr. Esther Klein", "Dr. Aaron Friedman",
            "Dr. Ruth Goldstein", "Dr. Daniel Silver", "Dr. Naomi Adler", "Dr. Benjamin Katz",
            "Dr. Hannah Stern", "Dr. Joshua Rubin", "Dr. Leah Feldman", "Dr. Samuel Gross",
            "Dr. Rebecca Stein", "Dr. Isaac Rosen", "Dr. Deborah Cohen", "Dr. Jacob Levy",
            "Dr. Rachel Weiss", "Dr. Nathan Green", "Dr. Sarah Rosenberg", "Dr. David Klein",
            "Dr. Miriam Friedman", "Dr. Jonathan Goldstein", "Dr. Esther Silver", "Dr. Aaron Adler",
            "Dr. Ruth Katz", "Dr. Daniel Stern", "Dr. Naomi Rubin", "Dr. Benjamin Feldman",
            "Dr. Hannah Gross", "Dr. Joshua Stein", "Dr. Leah Rosen", "Dr. Samuel Cohen",
            "Dr. Rebecca Levy", "Dr. Isaac Weiss", "Dr. Deborah Green", "Dr. Jacob Rosenberg",
            "Dr. Rachel Klein", "Dr. Nathan Friedman", "Dr. Sarah Goldstein", "Dr. David Silver",
            "Dr. Miriam Adler", "Dr. Jonathan Katz", "Dr. Esther Stern", "Dr. Aaron Rubin",
            "Dr. Ruth Feldman", "Dr. Daniel Gross", "Dr. Naomi Stein", "Dr. Benjamin Rosen"
        ]
        
        admin_names = [
            "Admin Manager", "System Administrator", "Clinic Director", "Operations Manager",
            "Practice Manager", "Administrative Director", "Clinic Coordinator", "Practice Administrator"
        ]
        
        for i in range(CONFIG['num_users']):
            # Determine user type based on production-like distribution
            if i < 45:  # 90% therapists
                full_name = therapist_names[i] if i < len(therapist_names) else f"Dr. {self.random_string(8)} {self.random_string(6)}"
                role = 'USER'
                enabled = True  # Most therapists are enabled
                approval_status = 'APPROVED'  # Most therapists are approved
            else:  # 10% admins
                full_name = admin_names[i - 45] if (i - 45) < len(admin_names) else f"Admin {self.random_string(6)}"
                role = 'ADMIN'
                enabled = True
                approval_status = 'APPROVED'
            
            # Generate username based on full name
            username = full_name.lower().replace(' ', '.').replace('dr.', '').replace('.', '')
            username = f"{username}{i}" if username else f"user{i}"
            
            # Generate email
            email = f"{username}@clinic.example.com"
            
            # Edge cases for some users
            if random.random() < 0.05:  # 5% edge case
                username = self.get_edge_case_or_random(
                    ["", "   ", "NULL", "user'--", "user\"--", "user\\--"],
                    lambda: username
                )
                email = self.get_edge_case_or_random(EDGE_CASES['emails'], lambda: email)
                full_name = self.get_edge_case_or_random(EDGE_CASES['names'], lambda: full_name)
            
            password = "$2a$10$PD5iyqOP/2BOgETgrMrC8uRjEu.P17cuArZESURXbE7aoAwz.U1Ri"
            
            # Generate created_at with realistic distribution
            created_at = self.random_date(
                datetime.datetime.now() - datetime.timedelta(days=730),  # Up to 2 years ago
                datetime.datetime.now()
            )
            
            # Add some pending/rejected users for testing
            if random.random() < 0.1:  # 10% chance for non-approved status
                approval_status = random.choice(['PENDING', 'REJECTED'])
                enabled = random.choice([True, False])
            
            try:
                self.cursor.execute("""
                    INSERT INTO users (username, email, full_name, password, role, enabled, approval_status, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (username, email, full_name, password, role, enabled, approval_status, created_at))
                
                user_id = self.cursor.lastrowid
                self.user_ids.append(user_id)
                
            except mysql.connector.Error as err:
                logger.warning(f"Failed to insert user {i}: {err}")
                continue
        
        logger.info(f"Generated {len(self.user_ids)} users ({45 if len(self.user_ids) >= 45 else len(self.user_ids)} therapists, {len(self.user_ids) - 45 if len(self.user_ids) > 45 else 0} admins)")
    
    def generate_clients(self):
        """Generate production-like clients with realistic distribution"""
        logger.info("Generating clients...")
        
        # Production-like client names (Israeli names)
        client_first_names = [
            "Yosef", "Moshe", "David", "Aharon", "Yitzhak", "Yaakov", "Shlomo", "Yehuda",
            "Avraham", "Yisrael", "Yehoshua", "Yonatan", "Shmuel", "Daniel", "Eliyahu",
            "Sarah", "Rivka", "Rachel", "Leah", "Miriam", "Esther", "Chana", "Devorah",
            "Yael", "Tamar", "Ruth", "Naomi", "Michal", "Avigail", "Hannah", "Sara",
            "Maya", "Noa", "Yael", "Tamar", "Ruth", "Naomi", "Michal", "Avigail",
            "Ariel", "Eitan", "Noam", "Tomer", "Guy", "Roi", "Omer", "Itai", "Yair",
            "Lior", "Nir", "Tal", "Gal", "Ran", "Doron", "Amir", "Eyal", "Gil",
            "Adi", "Shai", "Roi", "Omer", "Itai", "Yair", "Lior", "Nir", "Tal"
        ]
        
        client_last_names = [
            "Cohen", "Levy", "Green", "Rosenberg", "Schwartz", "Weiss", "Klein", "Friedman",
            "Goldstein", "Silver", "Adler", "Katz", "Stern", "Rubin", "Feldman", "Gross",
            "Stein", "Rosen", "Cohen", "Levy", "Weiss", "Green", "Rosenberg", "Klein",
            "Friedman", "Goldstein", "Silver", "Adler", "Katz", "Stern", "Rubin", "Feldman",
            "Gross", "Stein", "Rosen", "Cohen", "Levy", "Weiss", "Green", "Rosenberg",
            "Klein", "Friedman", "Goldstein", "Silver", "Adler", "Katz", "Stern", "Rubin"
        ]
        
        # Realistic client notes
        client_notes = [
            "Anxiety and depression treatment",
            "Couples therapy sessions",
            "Trauma-focused therapy",
            "ADHD assessment and treatment",
            "Eating disorder recovery",
            "PTSD treatment",
            "Family therapy",
            "Child and adolescent therapy",
            "Substance abuse counseling",
            "Grief and loss therapy",
            "Stress management",
            "Anger management",
            "Self-esteem issues",
            "Relationship counseling",
            "Work-related stress",
            "Parenting support",
            "Life transition support",
            "Chronic pain management",
            "Sleep disorder treatment",
            "OCD treatment",
            "Bipolar disorder management",
            "Borderline personality disorder",
            "Autism spectrum support",
            "Learning disability assessment",
            "Career counseling"
        ]
        
        client_count = 0
        
        for user_id in self.user_ids:
            # Only therapists have clients (not admins)
            if user_id <= 45:  # Assuming first 45 are therapists
                num_clients = random.randint(15, CONFIG['num_clients_per_user'])
                
                for i in range(num_clients):
                    # Generate realistic Israeli name
                    first_name = random.choice(client_first_names)
                    last_name = random.choice(client_last_names)
                    full_name = f"{first_name} {last_name}"
                    
                    # Edge cases for some clients
                    if random.random() < 0.05:  # 5% edge case
                        full_name = self.get_edge_case_or_random(EDGE_CASES['names'], lambda: full_name)
                    
                    # Generate email based on name
                    email = f"{first_name.lower()}.{last_name.lower()}@gmail.com"
                    if random.random() < 0.05:  # 5% edge case
                        email = self.get_edge_case_or_random(EDGE_CASES['emails'], lambda: email)
                    
                    # Generate Israeli phone number
                    phone = f"05{random.randint(10000000, 99999999)}"
                    if random.random() < 0.05:  # 5% edge case
                        phone = self.get_edge_case_or_random(EDGE_CASES['phones'], lambda: phone)
                    
                    # Generate realistic notes
                    notes = random.choice(client_notes)
                    if random.random() < 0.05:  # 5% edge case
                        notes = self.get_edge_case_or_random(
                            ["", "   ", "NULL", "Notes'--", "Notes\"--", "Notes\\--", "A" * 1000],
                            lambda: random.choice(client_notes)
                        )
                    
                    # Most clients are active (realistic)
                    is_active = random.choice([True, True, True, False])  # 75% active
                    
                    # Generate realistic creation date
                    created_at = self.random_date(
                        datetime.datetime.now() - datetime.timedelta(days=730),  # Up to 2 years ago
                        datetime.datetime.now()
                    )
                    
                    try:
                        # Assign a random client source
                        source_id = random.choice(self.client_source_ids)
                        
                        self.cursor.execute("""
                            INSERT INTO clients (user_id, source_id, full_name, email, phone, notes, is_active, created_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """, (user_id, source_id, full_name, email, phone, notes, is_active, created_at))
                        
                        client_id = self.cursor.lastrowid
                        self.client_ids.append(client_id)
                        client_count += 1
                        
                    except mysql.connector.Error as err:
                        logger.warning(f"Failed to insert client {i} for user {user_id}: {err}")
                        continue
        
        logger.info(f"Generated {client_count} clients for therapists")
    
    def get_existing_data(self):
        """Get existing IDs from database"""
        logger.info("Fetching existing data...")
        
        # Get client sources
        self.cursor.execute("SELECT id FROM client_sources")
        self.client_source_ids = [row[0] for row in self.cursor.fetchall()]
        
        # Get payment types
        self.cursor.execute("SELECT id FROM payment_types")
        self.payment_type_ids = [row[0] for row in self.cursor.fetchall()]
        
        # Get personal meeting types
        self.cursor.execute("SELECT id FROM personal_meeting_types")
        self.personal_meeting_type_ids = [row[0] for row in self.cursor.fetchall()]
        
        logger.info(f"Found {len(self.client_source_ids)} client sources, {len(self.payment_type_ids)} payment types, {len(self.personal_meeting_type_ids)} personal meeting types")
    
    def generate_meetings(self):
        """Generate production-like meetings with realistic scheduling patterns"""
        logger.info("Generating meetings...")
        
        # Get clients grouped by user
        self.cursor.execute("SELECT id, user_id FROM clients")
        clients_by_user = {}
        for client_id, user_id in self.cursor.fetchall():
            if user_id not in clients_by_user:
                clients_by_user[user_id] = []
            clients_by_user[user_id].append(client_id)
        
        meeting_count = 0
        start_date = datetime.datetime.now() - datetime.timedelta(days=CONFIG['date_range_days'])
        end_date = datetime.datetime.now() + datetime.timedelta(days=30)
        
        # Realistic meeting notes and summaries
        meeting_notes = [
            "Initial assessment session",
            "Follow-up therapy session",
            "Crisis intervention",
            "Progress review",
            "Family session",
            "Couples therapy",
            "Group therapy session",
            "Assessment and evaluation",
            "Treatment planning session",
            "Relapse prevention",
            "Coping skills training",
            "Mindfulness practice",
            "Cognitive behavioral therapy",
            "Dialectical behavior therapy",
            "Exposure therapy",
            "EMDR session",
            "Play therapy",
            "Art therapy",
            "Music therapy",
            "Movement therapy"
        ]
        
        meeting_summaries = [
            "Client showed significant progress in managing anxiety symptoms. Implemented new coping strategies effectively.",
            "Explored childhood trauma and its impact on current relationships. Client demonstrated increased self-awareness.",
            "Focused on communication skills in couples therapy. Both partners engaged actively in the session.",
            "Conducted comprehensive assessment for ADHD. Client reported improved focus with medication management.",
            "Addressed eating disorder recovery progress. Client maintained healthy eating patterns this week.",
            "PTSD treatment session - client processed traumatic memories with reduced distress levels.",
            "Family therapy focused on improving parent-child communication. Positive changes observed.",
            "Child therapy session - used play therapy to address behavioral concerns.",
            "Substance abuse counseling - client maintained sobriety and attended support groups.",
            "Grief therapy - client processed loss and developed healthy coping mechanisms.",
            "Stress management techniques practiced. Client reported reduced work-related anxiety.",
            "Anger management session - client learned new conflict resolution skills.",
            "Self-esteem building activities. Client demonstrated increased confidence.",
            "Relationship counseling - addressed trust issues and communication patterns.",
            "Work stress management - developed strategies for work-life balance.",
            "Parenting support - discussed effective discipline techniques.",
            "Life transition support - client adapted well to recent changes.",
            "Chronic pain management - integrated psychological and physical approaches.",
            "Sleep disorder treatment - implemented sleep hygiene practices.",
            "OCD treatment - exposure and response prevention techniques practiced."
        ]
        
        for user_id, clients in clients_by_user.items():
            for client_id in clients:
                # Generate realistic number of meetings per client
                num_meetings = random.randint(8, CONFIG['num_meetings_per_client'])
                
                # Create meeting schedule with realistic patterns
                meeting_dates = []
                for i in range(num_meetings):
                    # Generate meeting date with realistic distribution
                    if i == 0:  # First meeting
                        meeting_date = self.random_date(start_date, start_date + datetime.timedelta(days=30))
                    else:
                        # Subsequent meetings with realistic intervals
                        last_meeting = meeting_dates[-1] if meeting_dates else start_date
                        interval_days = random.choice([7, 7, 7, 14, 14, 21, 30])  # Weekly, bi-weekly, monthly
                        meeting_date = last_meeting + datetime.timedelta(days=interval_days)
                        if meeting_date > end_date:
                            break
                    
                    meeting_dates.append(meeting_date)
                
                # Create meetings with realistic scheduling
                for i, meeting_date in enumerate(meeting_dates):
                    # Generate realistic time slots (business hours)
                    hour = random.choice([9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
                    minute = random.choice([0, 15, 30, 45])
                    time_slot = datetime.datetime.combine(meeting_date.date(), datetime.time(hour, minute))
                    
                    # Create multiple meetings on the same day (realistic scenario)
                    if random.random() < 0.15:  # 15% chance for multiple meetings per day
                        num_same_day = random.randint(2, 3)
                        for j in range(num_same_day):
                            hour = random.choice([9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
                            minute = random.choice([0, 15, 30, 45])
                            time_slot = datetime.datetime.combine(meeting_date.date(), datetime.time(hour, minute))
                            self._create_meeting(user_id, client_id, time_slot, i, meeting_notes, meeting_summaries)
                            meeting_count += 1
                        continue
                    
                    self._create_meeting(user_id, client_id, time_slot, i, meeting_notes, meeting_summaries)
                    meeting_count += 1
        
        logger.info(f"Generated {meeting_count} meetings")
    
    def _create_meeting(self, user_id, client_id, meeting_date, meeting_index=0, meeting_notes=None, meeting_summaries=None):
        """Create a single meeting with production-like data"""
        payment_type_id = random.choice([None] + self.payment_type_ids)
        
        # Get client's source for pricing
        self.cursor.execute("SELECT source_id FROM clients WHERE id = %s", (client_id,))
        client_source_id = self.cursor.fetchone()[0]
        
        # Realistic duration and pricing based on client's source
        if client_source_id == 1:  # Private
            duration = random.choice([60, 90, 120])
            price = random.choice([350.00, 400.00, 450.00])
        elif client_source_id == 2:  # Natal
            duration = random.choice([45, 60, 90])
            price = random.choice([300.00, 350.00, 400.00])
        else:  # Clalit
            duration = random.choice([30, 45, 60])
            price = random.choice([280.00, 300.00, 320.00])
        
        # Generate realistic notes and summaries
        if meeting_notes and meeting_summaries:
            notes = random.choice(meeting_notes)
            summary = random.choice(meeting_summaries)
        else:
            notes = random.choice(['', f'Meeting notes {self.random_string(10)}', None])
            summary = random.choice(['', f'Meeting summary {self.random_string(20)}', None])
        
        # Edge cases for some meetings
        if random.random() < 0.05:  # 5% edge case
            notes = self.get_edge_case_or_random(
                ["", "   ", "NULL", "Notes'--", "Notes\"--", "Notes\\--", "A" * 1000],
                lambda: notes
            )
            summary = self.get_edge_case_or_random(
                ["", "   ", "NULL", "Summary'--", "Summary\"--", "Summary\\--", "A" * 2000],
                lambda: summary
            )
        
        # Realistic status distribution
        if meeting_date < datetime.datetime.now():
            status = random.choice(['COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
        else:
            status = random.choice(['SCHEDULED', 'SCHEDULED', 'SCHEDULED', 'CANCELLED'])
        
        # Realistic payment scenarios
        if status == 'COMPLETED':
            is_paid = random.choice([True, True, True, False])  # 75% paid
        else:
            is_paid = random.choice([True, False])
        
        payment_date = None
        if is_paid and status == 'COMPLETED':
            payment_date = self.random_date(meeting_date, meeting_date + datetime.timedelta(days=7))
        
        google_event_id = random.choice([None, f"google_event_{self.random_string(10)}"])
        is_active = random.choice([True, True, True, False])  # 75% active
        
        try:
            self.cursor.execute("""
                INSERT INTO meetings (user_id, client_id, payment_type_id, meeting_date, 
                                   duration, price, notes, summary, status, is_paid, payment_date, 
                                   google_event_id, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (user_id, client_id, payment_type_id, meeting_date, duration, price,
                  notes, summary, status, is_paid, payment_date, google_event_id, is_active, meeting_date))
            
        except mysql.connector.Error as err:
            logger.warning(f"Failed to insert meeting: {err}")
    
    def generate_personal_meetings(self):
        """Generate production-like personal meetings for therapists"""
        logger.info("Generating personal meetings...")
        
        meeting_count = 0
        start_date = datetime.datetime.now() - datetime.timedelta(days=CONFIG['date_range_days'])
        end_date = datetime.datetime.now() + datetime.timedelta(days=30)
        
        # Realistic therapist names for personal meetings
        therapist_names = [
            "Dr. Sarah Cohen", "Dr. Michael Levy", "Dr. Rachel Green", "Dr. David Rosenberg",
            "Dr. Miriam Schwartz", "Dr. Jonathan Weiss", "Dr. Esther Klein", "Dr. Aaron Friedman",
            "Dr. Ruth Goldstein", "Dr. Daniel Silver", "Dr. Naomi Adler", "Dr. Benjamin Katz",
            "Dr. Hannah Stern", "Dr. Joshua Rubin", "Dr. Leah Feldman", "Dr. Samuel Gross"
        ]
        
        # Realistic personal meeting notes
        personal_meeting_notes = [
            "Personal therapy session",
            "Guidance and counseling session",
            "Therapeutic intervention",
            "Personal development session",
            "Mental health guidance",
            "Therapeutic support session",
            "Personal growth counseling",
            "Therapeutic guidance session",
            "Personal wellness session",
            "Guidance and support session",
            "Personal therapy intervention",
            "Life guidance session",
            "Therapeutic counseling",
            "Personal development guidance",
            "Mental health therapy",
            "Guidance and therapy session",
            "Personal therapeutic support",
            "Life counseling session",
            "Therapeutic guidance intervention",
            "Personal wellness guidance"
        ]
        
        # Realistic personal meeting summaries
        personal_meeting_summaries = [
            "Explored personal challenges and developed coping strategies. Made significant progress in self-awareness.",
            "Received guidance on professional development and career advancement opportunities.",
            "Addressed personal stress and implemented self-care techniques for better work-life balance.",
            "Discussed therapeutic approaches and their application to personal growth.",
            "Explored personal boundaries and relationship dynamics in therapeutic context.",
            "Focused on personal growth and continuing development opportunities.",
            "Reviewed personal challenges and developed intervention strategies.",
            "Explored personal reactions and emotional management techniques.",
            "Discussed personal development and life planning strategies.",
            "Practiced personal assessment techniques and self-reflection skills.",
            "Explored personal relationship dynamics and communication strategies.",
            "Addressed personal stress and implemented self-care strategies.",
            "Reviewed personal decision-making processes and life choices.",
            "Discussed personal growth and skill development opportunities.",
            "Explored personal development opportunities and continuing education.",
            "Focused on personal guidance and development support.",
            "Explored personal challenges and developed therapeutic interventions.",
            "Received valuable guidance on personal and professional development.",
            "Addressed personal wellness and implemented therapeutic strategies.",
            "Discussed personal growth and therapeutic guidance approaches."
        ]
        
        for user_id in self.user_ids:
            # Only therapists have personal meetings (not admins)
            if user_id <= 45:  # Assuming first 45 are therapists
                num_meetings = random.randint(8, CONFIG['num_personal_meetings_per_user'])
                
                # Create realistic personal meeting schedule
                meeting_dates = []
                for i in range(num_meetings):
                    if i == 0:  # First meeting
                        meeting_date = self.random_date(start_date, start_date + datetime.timedelta(days=60))
                    else:
                        # Subsequent meetings with realistic intervals
                        last_meeting = meeting_dates[-1] if meeting_dates else start_date
                        interval_days = random.choice([7, 14, 21, 30, 30, 60])  # Weekly to monthly
                        meeting_date = last_meeting + datetime.timedelta(days=interval_days)
                        if meeting_date > end_date:
                            break
                    
                    meeting_dates.append(meeting_date)
                
                for i, meeting_date in enumerate(meeting_dates):
                    therapist_name = random.choice(therapist_names)
                    meeting_type_id = random.choice([1, 2]) if len(self.personal_meeting_type_ids) >= 2 else random.choice(self.personal_meeting_type_ids)
                    provider_type = random.choice(['Therapist', 'Guide', 'Counselor', 'Mentor', 'Life Coach'])
                    provider_credentials = random.choice(['Licensed Therapist', 'Professional Guide', 'Certified Counselor', 'Life Coach', 'Personal Development Specialist', ''])
                    
                    # Generate realistic time slots
                    hour = random.choice([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
                    minute = random.choice([0, 15, 30, 45])
                    time_slot = datetime.datetime.combine(meeting_date.date(), datetime.time(hour, minute))
                    
                    # Realistic duration and pricing based on type
                    if meeting_type_id == 1:  # Personal Therapy
                        duration = 60
                        price = 400.00
                    else:  # Guidance
                        duration = 90
                        price = 500.00
                    
                    notes = random.choice(personal_meeting_notes)
                    summary = random.choice(personal_meeting_summaries)
                    
                    # Realistic status distribution
                    if meeting_date < datetime.datetime.now():
                        status = random.choice(['COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
                    else:
                        status = random.choice(['SCHEDULED', 'SCHEDULED', 'SCHEDULED', 'CANCELLED'])
                    
                    # Realistic payment scenarios
                    if status == 'COMPLETED':
                        is_paid = random.choice([True, True, True, False])  # 75% paid
                    else:
                        is_paid = random.choice([True, False])
                    
                    payment_date = None
                    if is_paid and status == 'COMPLETED':
                        payment_date = self.random_date(time_slot, time_slot + datetime.timedelta(days=7))
                    
                    google_event_id = random.choice([None, f"google_event_{self.random_string(10)}"])
                    is_recurring = random.choice([True, False])
                    
                    recurrence_frequency = None
                    next_due_date = None
                    if is_recurring:
                        recurrence_frequency = random.choice(['weekly', 'monthly', 'quarterly'])
                        next_due_date = self.random_date(time_slot.date(), time_slot.date() + datetime.timedelta(days=365))
                    
                    is_active = random.choice([True, True, True, False])  # 75% active
                    
                    try:
                        self.cursor.execute("""
                            INSERT INTO personal_meetings (user_id, therapist_name, meeting_type_id, provider_type,
                                                        provider_credentials, meeting_date, duration, price, notes,
                                                        summary, status, is_paid, payment_date, google_event_id,
                                                        is_recurring, recurrence_frequency, next_due_date, is_active, created_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (user_id, therapist_name, meeting_type_id, provider_type, provider_credentials,
                             time_slot, duration, price, notes, summary, status, is_paid, payment_date,
                             google_event_id, is_recurring, recurrence_frequency, next_due_date, is_active, time_slot))
                        
                        meeting_count += 1
                        
                    except mysql.connector.Error as err:
                        logger.warning(f"Failed to insert personal meeting: {err}")
        
        logger.info(f"Generated {meeting_count} personal meetings for therapists")
    
    def generate_expenses(self):
        """Generate production-like expenses with realistic categories and amounts"""
        logger.info("Generating expenses...")
        
        expense_count = 0
        start_date = datetime.datetime.now() - datetime.timedelta(days=CONFIG['date_range_days'])
        end_date = datetime.datetime.now() + datetime.timedelta(days=30)
        
        # Production-like expense categories with realistic amounts
        expense_categories = {
            'Office Supplies': {
                'names': ['Printer paper', 'Pens and notebooks', 'Staples and clips', 'Whiteboard markers', 'File folders'],
                'amounts': (10.00, 200.00)
            },
            'Professional Development': {
                'names': ['Conference registration', 'Workshop fees', 'Online course', 'Professional books', 'Certification exam'],
                'amounts': (200.00, 2000.00)
            },
            'Insurance': {
                'names': ['Professional liability insurance', 'Office insurance', 'Health insurance', 'Disability insurance'],
                'amounts': (500.00, 5000.00)
            },
            'Software': {
                'names': ['Therapy software license', 'Accounting software', 'Video conferencing platform', 'Practice management system'],
                'amounts': (50.00, 500.00)
            },
            'Marketing': {
                'names': ['Website hosting', 'Business cards', 'Online advertising', 'Brochures and flyers', 'SEO services'],
                'amounts': (100.00, 1000.00)
            },
            'Travel': {
                'names': ['Conference travel', 'Client home visits', 'Professional meetings', 'Training workshops'],
                'amounts': (50.00, 500.00)
            },
            'Equipment': {
                'names': ['Computer upgrade', 'Office furniture', 'Therapy equipment', 'Audio recording device', 'Security camera'],
                'amounts': (200.00, 3000.00)
            },
            'Utilities': {
                'names': ['Electricity bill', 'Internet service', 'Phone service', 'Water bill', 'Heating/cooling'],
                'amounts': (100.00, 800.00)
            },
            'Rent': {
                'names': ['Office rent', 'Storage unit', 'Meeting room rental'],
                'amounts': (2000.00, 8000.00)
            },
            'Professional Services': {
                'names': ['Accounting services', 'Legal consultation', 'IT support', 'Cleaning services'],
                'amounts': (150.00, 1500.00)
            }
        }
        
        # Realistic expense descriptions
        expense_descriptions = [
            "Monthly office supplies for therapy practice",
            "Professional development workshop registration",
            "Annual professional liability insurance premium",
            "Software license renewal for practice management",
            "Marketing materials for new client acquisition",
            "Travel expenses for professional conference",
            "Equipment upgrade for improved client care",
            "Monthly utility bills for office space",
            "Office rent payment for therapy practice",
            "Professional services for practice management"
        ]
        
        for user_id in self.user_ids:
            # Only therapists have significant expenses (not admins)
            if user_id <= 45:  # Assuming first 45 are therapists
                num_expenses = random.randint(20, CONFIG['num_expenses_per_user'])
                
                # Create realistic expense schedule
                expense_dates = []
                for i in range(num_expenses):
                    if i == 0:  # First expense
                        expense_date = self.random_date(start_date, start_date + datetime.timedelta(days=30))
                    else:
                        # Subsequent expenses with realistic intervals
                        last_expense = expense_dates[-1] if expense_dates else start_date
                        interval_days = random.choice([1, 7, 14, 30, 30, 60, 90])  # Daily to quarterly
                        expense_date = last_expense + datetime.timedelta(days=interval_days)
                        if expense_date > end_date:
                            break
                    
                    expense_dates.append(expense_date)
                
                for i, expense_date in enumerate(expense_dates):
                    category = random.choice(list(expense_categories.keys()))
                    category_data = expense_categories[category]
                    
                    name = random.choice(category_data['names'])
                    min_amount, max_amount = category_data['amounts']
                    amount = round(random.uniform(min_amount, max_amount), 2)
                    
                    # Edge cases for some expenses
                    if random.random() < 0.05:  # 5% edge case
                        name = self.get_edge_case_or_random(
                            ["", "   ", "NULL", "Expense'--", "Expense\"--", "Expense\\--", "A" * 255],
                            lambda: name
                        )
                    
                    description = random.choice(expense_descriptions)
                    if random.random() < 0.05:  # 5% edge case
                        description = self.get_edge_case_or_random(
                            ["", "   ", "NULL", "Description'--", "Description\"--", "Description\\--", "A" * 1000],
                            lambda: description
                        )
                    
                    currency = random.choice(['ILS', 'ILS', 'ILS', 'USD', 'EUR'])  # Mostly ILS
                    
                    notes = random.choice(['', f'Notes for {name}', None])
                    
                    # Realistic recurring expenses
                    is_recurring = random.choice([True, True, False, False, False])  # 40% recurring
                    recurrence_frequency = None
                    next_due_date = None
                    if is_recurring:
                        recurrence_frequency = random.choice(['monthly', 'quarterly', 'yearly'])
                        next_due_date = self.random_date(datetime.datetime.now(), datetime.datetime.now() + datetime.timedelta(days=365)).date()
                    
                    # Realistic payment scenarios
                    is_paid = random.choice([True, True, True, False])  # 75% paid
                    payment_method = random.choice(['Bank Transfer', 'Credit Card', 'Cash', 'Check'])
                    receipt_url = random.choice([None, f"https://receipt.example.com/{self.random_string(10)}"])
                    is_active = random.choice([True, True, True, False])  # 75% active
                    
                    try:
                        self.cursor.execute("""
                            INSERT INTO expenses (user_id, name, description, amount, currency, category, notes,
                                               expense_date, is_recurring, recurrence_frequency, next_due_date,
                                               is_paid, payment_method, receipt_url, is_active, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (user_id, name, description, amount, currency, category, notes, expense_date.date(),
                             is_recurring, recurrence_frequency, next_due_date, is_paid, payment_method,
                             receipt_url, is_active, datetime.datetime.now(), datetime.datetime.now()))
                        
                        expense_count += 1
                        
                    except mysql.connector.Error as err:
                        logger.warning(f"Failed to insert expense: {err}")
        
        logger.info(f"Generated {expense_count} expenses for therapists")
    
    def generate_calendar_integrations(self):
        """Generate calendar integrations for some users"""
        logger.info("Generating calendar integrations...")
        
        integration_count = 0
        
        for user_id in self.user_ids:
            # Only some users have calendar integration
            if random.random() < 0.3:  # 30% chance
                google_calendar_id = f"calendar_{self.random_string(10)}@group.calendar.google.com"
                access_token = f"access_token_{self.random_string(50)}"
                refresh_token = f"refresh_token_{self.random_string(50)}"
                token_expiry = self.random_date(datetime.datetime.now(), datetime.datetime.now() + datetime.timedelta(days=30))
                is_active = random.choice([True, False])
                
                try:
                    self.cursor.execute("""
                        INSERT INTO calendar_integration (user_id, google_calendar_id, access_token, refresh_token,
                                                        token_expiry, is_active, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (user_id, google_calendar_id, access_token, refresh_token, token_expiry, is_active,
                         datetime.datetime.now(), datetime.datetime.now()))
                    
                    integration_count += 1
                    
                except mysql.connector.Error as err:
                    logger.warning(f"Failed to insert calendar integration: {err}")
        
        logger.info(f"Generated {integration_count} calendar integrations")
    
    def run(self):
        """Run the complete data generation process"""
        try:
            self.connect()
            self.get_existing_data()
            
            logger.info("Starting test data generation...")
            
            self.generate_users()
            self.generate_clients()
            self.generate_meetings()
            self.generate_personal_meetings()
            self.generate_expenses()
            self.generate_calendar_integrations()
            
            logger.info("Test data generation completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during data generation: {e}")
            raise
        finally:
            self.disconnect()

def main():
    """Main function"""
    print("Clinic Management System - Production Data Generator")
    print("=" * 60)
    print("This will create a production-like environment with:")
    print(f"- {CONFIG['num_users']} users (45 therapists + 5 admins)")
    print(f"- ~{CONFIG['num_users'] * CONFIG['num_clients_per_user']} clients (25 per therapist)")
    print(f"- ~{CONFIG['num_users'] * CONFIG['num_clients_per_user'] * CONFIG['num_meetings_per_client']} meetings (30 per client)")
    print(f"- ~{CONFIG['num_users'] * CONFIG['num_personal_meetings_per_user']} personal meetings (15 per therapist)")
    print(f"- ~{CONFIG['num_users'] * CONFIG['num_expenses_per_user']} expenses (50 per therapist)")
    print(f"- Calendar integrations for ~30% of users")
    print(f"- {CONFIG['date_range_days']} days of historical data")
    print("=" * 60)
    
    generator = TestDataGenerator()
    generator.run()
    
    print("\n🎉 Production data generation completed!")
    print("=" * 60)
    print("Your clinic management system now has:")
    print("✅ Realistic therapist and client names")
    print("✅ Multiple meetings per day with different sources")
    print("✅ Various meeting statuses and payment scenarios")
    print("✅ Recurring and one-time expenses")
    print("✅ Professional development and supervision sessions")
    print("✅ Edge cases for testing system robustness")
    print("✅ Full year of historical data")
    print("=" * 60)
    print("You can now test all features of your application!")

if __name__ == "__main__":
    main() 