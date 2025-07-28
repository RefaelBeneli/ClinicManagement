package com.clinic.config

import com.clinic.entity.Role
import com.clinic.entity.User
import com.clinic.entity.UserApprovalStatus
import com.clinic.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class DataInitializer(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        // Create default admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            val adminUser = User(
                username = "admin",
                email = "admin@clinicmanagement.com",
                fullName = "System Administrator",
                password = passwordEncoder.encode("admin123"),
                role = Role.ADMIN,
                enabled = true,
                approvalStatus = UserApprovalStatus.APPROVED,
                approvedBy = null, // Self-approved during initialization
                approvedDate = LocalDateTime.now(),
                rejectionReason = null,
                createdAt = LocalDateTime.now()
            )
            
            userRepository.save(adminUser)
            println("✅ Default admin user created successfully!")
            println("   Username: admin")
            println("   Password: admin123")
            println("   ⚠️  Please change the default password after first login!")
        }
        
        println("ℹ️  Application started successfully!")
    }
} 