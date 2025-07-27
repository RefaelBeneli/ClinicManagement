package com.clinic.config

import com.clinic.entity.Role
import com.clinic.entity.User
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
        createAdminUser()
    }

    private fun createAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByUsername("admin").isEmpty) {
            val adminUser = User(
                username = "admin",
                email = "admin@clinic.com",
                fullName = "System Administrator",
                password = passwordEncoder.encode("admin123"),
                role = Role.ADMIN,
                enabled = true,
                createdAt = LocalDateTime.now()
            )
            
            userRepository.save(adminUser)
            println("✅ Admin user created successfully!")
            println("📧 Username: admin")
            println("🔑 Password: admin123")
            println("⚠️  Please change the password after first login!")
        } else {
            println("ℹ️  Admin user already exists")
        }
    }
} 