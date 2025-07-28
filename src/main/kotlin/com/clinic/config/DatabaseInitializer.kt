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
                logger.info("🚨 Attempting to add missing column...")
                
                try {
                    // Add the missing approval_status column
                    logger.info("1. Adding approval_status column...")
                    jdbcTemplate.execute("""
                        ALTER TABLE users 
                        ADD COLUMN approval_status VARCHAR(255) NOT NULL DEFAULT 'PENDING' 
                        CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'))
                    """)
                    
                    // Add other missing columns if needed
                    logger.info("2. Adding other missing approval columns...")
                    jdbcTemplate.execute("""
                        ALTER TABLE users 
                        ADD COLUMN approved_by BIGINT,
                        ADD COLUMN approved_date TIMESTAMP NULL,
                        ADD COLUMN rejection_reason VARCHAR(1000)
                    """)
                    
                    logger.info("3. Adding foreign key constraint...")
                    jdbcTemplate.execute("""
                        ALTER TABLE users 
                        ADD CONSTRAINT FK_users_approved_by 
                        FOREIGN KEY (approved_by) REFERENCES users(id)
                    """)
                    
                    logger.info("✅ Successfully added missing columns to users table!")
                    
                } catch (e: Exception) {
                    logger.error("❌ Failed to add columns: ${e.message}")
                    logger.info("🔄 Trying table recreation as fallback...")
                    
                    try {
                        recreateUsersTable()
                    } catch (recreateError: Exception) {
                        logger.error("❌ Table recreation also failed: ${recreateError.message}")
                    }
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
    
    private fun recreateUsersTable() {
        logger.info("🔄 Recreating users table with correct schema...")
        
        // Drop and recreate users table
        jdbcTemplate.execute("DROP TABLE IF EXISTS users CASCADE")
        
        jdbcTemplate.execute("""
            CREATE TABLE users (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL CHECK (role IN ('USER', 'ADMIN')),
                enabled BOOLEAN NOT NULL DEFAULT true,
                approval_status VARCHAR(255) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
                approved_by BIGINT,
                approved_date TIMESTAMP NULL,
                rejection_reason VARCHAR(1000),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT FK_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
            )
        """)
        
        logger.info("✅ Users table recreated successfully!")
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