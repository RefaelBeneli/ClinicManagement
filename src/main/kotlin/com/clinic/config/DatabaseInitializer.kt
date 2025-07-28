package com.clinic.config

import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
@Profile("railway") // Only run on Railway deployment
class DatabaseInitializer(
    private val jdbcTemplate: JdbcTemplate
) : CommandLineRunner {
    
    private val logger = LoggerFactory.getLogger(DatabaseInitializer::class.java)

    override fun run(vararg args: String?) {
        try {
            logger.info("🔧 Railway Database Initializer - Checking schema...")
            
            // Check if approval_status column exists
            val hasApprovalStatus = checkColumnExists("users", "approval_status")
            
            if (!hasApprovalStatus) {
                logger.info("❌ approval_status column missing - attempting to add it")
                try {
                    jdbcTemplate.execute("""
                        ALTER TABLE users 
                        ADD COLUMN approval_status VARCHAR(255) DEFAULT 'PENDING' 
                        CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED'))
                    """)
                    logger.info("✅ approval_status column added successfully")
                } catch (e: Exception) {
                    logger.error("❌ Failed to add approval_status column: ${e.message}")
                    // If we can't add the column, the ddl-auto=create should handle it
                }
            } else {
                logger.info("✅ approval_status column already exists")
            }
            
            logger.info("🎯 Database initialization completed")
            
        } catch (e: Exception) {
            logger.error("🚨 Database initialization failed: ${e.message}")
            // Don't throw - let the app continue, ddl-auto=create will handle it
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