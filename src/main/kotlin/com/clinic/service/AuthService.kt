package com.clinic.service

import com.clinic.dto.AuthResponse
import com.clinic.dto.LoginRequest
import com.clinic.dto.RegisterRequest
import com.clinic.entity.User
import com.clinic.repository.UserRepository
import com.clinic.security.JwtUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationManager
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
        val authentication: Authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
        )

        SecurityContextHolder.getContext().authentication = authentication
        val jwt = jwtUtils.generateJwtToken(authentication)

        val user = authentication.principal as User
        return AuthResponse(
            token = jwt,
            username = user.username,
            email = user.email,
            fullName = user.fullName
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
        return authentication.principal as User
    }
} 