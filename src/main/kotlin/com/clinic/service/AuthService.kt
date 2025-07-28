package com.clinic.service

import com.clinic.dto.AuthResponse
import com.clinic.dto.LoginRequest
import com.clinic.dto.RegisterRequest
import com.clinic.entity.User
import com.clinic.entity.UserApprovalStatus
import com.clinic.repository.UserRepository
import com.clinic.security.JwtUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.DisabledException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService {

    @Autowired
    private lateinit var authenticationManager: AuthenticationManager

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @Autowired
    private lateinit var jwtUtils: JwtUtils

    fun authenticateUser(loginRequest: LoginRequest): AuthResponse {
        // Check if user exists and their approval status before authentication
        val user = userRepository.findByUsername(loginRequest.username)
            .orElseThrow { RuntimeException("Invalid username or password") }

        // Check user approval status
        when (user.approvalStatus) {
            UserApprovalStatus.PENDING -> {
                throw DisabledException("Your account is pending admin approval. Please wait for confirmation.")
            }
            UserApprovalStatus.REJECTED -> {
                val reason = user.rejectionReason ?: "No reason provided"
                throw DisabledException("Your account has been rejected. Reason: $reason")
            }
            UserApprovalStatus.APPROVED -> {
                // User is approved, check if enabled
                if (!user.isEnabled) {
                    throw DisabledException("Your account is disabled. Please contact admin.")
                }
            }
        }

        val authentication: Authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
        )

        SecurityContextHolder.getContext().authentication = authentication
        val jwt = jwtUtils.generateJwtToken(authentication)

        val authenticatedUser = authentication.principal as User
        return AuthResponse(
            token = jwt,
            username = authenticatedUser.username,
            email = authenticatedUser.email,
            fullName = authenticatedUser.fullName,
            role = authenticatedUser.role.name
        )
    }

    fun registerUser(registerRequest: RegisterRequest): User {
        if (userRepository.existsByUsername(registerRequest.username)) {
            throw RuntimeException("Error: Username is already taken!")
        }

        if (userRepository.existsByEmail(registerRequest.email)) {
            throw RuntimeException("Error: Email is already in use!")
        }

        val user = User(
            username = registerRequest.username,
            password = passwordEncoder.encode(registerRequest.password),
            email = registerRequest.email,
            fullName = registerRequest.fullName
        )

        return userRepository.save(user)
    }

    fun getCurrentUser(): User {
        val authentication = SecurityContextHolder.getContext().authentication
        
        return when (val principal = authentication.principal) {
            is User -> principal
            is org.springframework.security.core.userdetails.UserDetails -> {
                // If it's a UserDetails but not our User entity, load by username
                userRepository.findByUsername(principal.username)
                    .orElseThrow { RuntimeException("User not found: ${principal.username}") }
            }
            is String -> {
                // If principal is just a username string
                userRepository.findByUsername(principal)
                    .orElseThrow { RuntimeException("User not found: $principal") }
            }
            else -> {
                throw RuntimeException("Invalid authentication principal type: ${principal?.javaClass?.simpleName}")
            }
        }
    }
} 