package com.clinic.config

import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
@Profile("production") // Run on Railway production deployment
class DatabaseInitializer(
    private val jdbcTemplate: JdbcTemplate
) : CommandLineRunner {
    
    private val logger = LoggerFactory.getLogger(DatabaseInitializer::class.java)

    override fun run(vararg args: String?) {
        try {
            logger.info("🔧 Railway Production Database Initializer - AGGRESSIVE SCHEMA CHECK")
            logger.info("================================================================")
            
            // Check if approval_status column exists
            val hasApprovalStatus = checkColumnExists("users", "approval_status")
            
            if (!hasApprovalStatus) {
                logger.error("❌ CRITICAL: approval_status column MISSING from users table!")
                logger.info("🚨 Attempting AGGRESSIVE table recreation...")
                
                try {
                    // Drop and recreate users table with correct schema
                    logger.info("1. Dropping existing users table...")
                    jdbcTemplate.execute("DROP TABLE IF EXISTS users CASCADE")
                    
                    logger.info("2. Creating users table with correct schema...")
                    jdbcTemplate.execute("""
                        CREATE TABLE users (
                            id BIGSERIAL PRIMARY KEY,
                            username VARCHAR(255) NOT NULL UNIQUE,
                            email VARCHAR(255) NOT NULL,
                            full_name VARCHAR(255) NOT NULL,
                            password VARCHAR(255) NOT NULL,
                            role VARCHAR(255) NOT NULL CHECK (role IN ('USER', 'ADMIN')),
                            enabled BOOLEAN NOT NULL DEFAULT true,
                            approval_status VARCHAR(255) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
                            approved_by BIGINT,
                            approved_date TIMESTAMP(6),
                            rejection_reason VARCHAR(1000),
                            created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT FK_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
                        )
                    """)
                    
                    logger.info("3. Creating default admin user...")
                    jdbcTemplate.execute("""
                        INSERT INTO users (username, email, full_name, password, role, enabled, approval_status, created_at)
                        VALUES ('admin', 'admin@clinic.com', 'System Administrator', 
                                '$2a$10$rA8QrPEHdLtO1gqz6rAzHegj.8t.WOSEhQq5YbVQOOLwC0R4vRfme', 
                                'ADMIN', true, 'APPROVED', CURRENT_TIMESTAMP)
                    """)
                    
                    logger.info("✅ Successfully recreated users table with approval_status column!")
                    
                } catch (e: Exception) {
                    logger.error("❌ Failed to recreate users table: ${e.message}")
                    logger.error("Stack trace: ", e)
                }
            } else {
                logger.info("✅ approval_status column already exists")
            }
            
            // Verify the fix worked
            val finalCheck = checkColumnExists("users", "approval_status")
            if (finalCheck) {
                logger.info("🎯 VERIFICATION PASSED: approval_status column exists!")
            } else {
                logger.error("🚨 VERIFICATION FAILED: approval_status column still missing!")
            }
            
        } catch (e: Exception) {
            logger.error("🚨 Database initialization failed: ${e.message}")
            logger.error("Stack trace: ", e)
        }
    }
    
    private fun checkColumnExists(tableName: String, columnName: String): Boolean {
        return try {
            val count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_name = ? AND column_name = ?
            """, Int::class.java, tableName, columnName)
            count > 0
        } catch (e: Exception) {
            logger.warn("Could not check column existence: ${e.message}")
            false
        }
    }
} 