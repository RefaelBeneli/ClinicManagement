package com.clinic.security

import com.clinic.entity.User
import com.clinic.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class SecurityUtils {

    @Autowired
    private lateinit var jwtUtils: JwtUtils

    @Autowired
    private lateinit var userRepository: UserRepository

    fun getCurrentUserId(): Long? {
        val authentication = SecurityContextHolder.getContext().authentication
        return when (val principal = authentication?.principal) {
            is User -> principal.id
            is org.springframework.security.core.userdetails.UserDetails -> {
                // Load user by username to get the ID
                val user = userRepository.findByUsername(principal.username).orElse(null)
                user?.id
            }
            else -> null
        }
    }

    fun getCurrentUser(): User? {
        val authentication = SecurityContextHolder.getContext().authentication
        return when (val principal = authentication?.principal) {
            is User -> principal
            is org.springframework.security.core.userdetails.UserDetails -> {
                userRepository.findByUsername(principal.username).orElse(null)
            }
            else -> null
        }
    }

    fun isCurrentUserAdmin(): Boolean {
        val user = getCurrentUser()
        return user?.role == com.clinic.entity.Role.ADMIN
    }

    fun extractUserIdFromJwt(jwt: String?): Long? {
        if (jwt == null) return null
        return try {
            jwtUtils.getUserIdFromJwtToken(jwt)
        } catch (e: Exception) {
            null
        }
    }
} 