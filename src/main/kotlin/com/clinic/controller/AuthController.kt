package com.clinic.controller

import com.clinic.dto.AuthResponse
import com.clinic.dto.LoginRequest
import com.clinic.dto.MessageResponse
import com.clinic.dto.RegisterRequest
import com.clinic.service.AuthService
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController {

    private val logger = LoggerFactory.getLogger(AuthController::class.java)

    @Autowired
    private lateinit var authService: AuthService

    @PostMapping("/signin")
    fun authenticateUser(@Valid @RequestBody loginRequest: LoginRequest): ResponseEntity<*> {
        return try {
            val authResponse = authService.authenticateUser(loginRequest)
            ResponseEntity.ok(authResponse)
        } catch (e: org.springframework.security.authentication.DisabledException) {
            logger.error("Authentication failed for user: ${loginRequest.username}", e)
            ResponseEntity.badRequest().body(MessageResponse(e.message ?: "Account is disabled"))
        } catch (e: org.springframework.security.authentication.BadCredentialsException) {
            logger.error("Authentication failed for user: ${loginRequest.username}", e)
            ResponseEntity.badRequest().body(MessageResponse("Invalid username or password"))
        } catch (e: RuntimeException) {
            logger.error("Authentication failed for user: ${loginRequest.username}", e)
            ResponseEntity.badRequest().body(MessageResponse(e.message ?: "Authentication failed"))
        } catch (e: Exception) {
            logger.error("Authentication failed for user: ${loginRequest.username}", e)
            ResponseEntity.badRequest().body(MessageResponse("Authentication failed"))
        }
    }

    @PostMapping("/signup")
    fun registerUser(@Valid @RequestBody registerRequest: RegisterRequest): ResponseEntity<MessageResponse> {
        return try {
            authService.registerUser(registerRequest)
            ResponseEntity.ok(MessageResponse("User registered successfully!"))
        } catch (e: org.springframework.dao.DataIntegrityViolationException) {
            logger.error("Registration failed for user: ${registerRequest.username}", e)
            ResponseEntity.badRequest().body(MessageResponse("Username or email already exists"))
        } catch (e: RuntimeException) {
            logger.error("Registration failed for user: ${registerRequest.username}", e)
            ResponseEntity.badRequest().body(MessageResponse(e.message ?: "Registration failed"))
        }
    }

    @GetMapping("/me")
    fun getCurrentUser(): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            ResponseEntity.ok(mapOf(
                "id" to user.id,
                "username" to user.username,
                "email" to user.email,
                "fullName" to user.fullName,
                "role" to user.role.name
            ))
        } catch (e: Exception) {
            logger.error("Failed to get current user info", e)
            ResponseEntity.badRequest().body(MessageResponse("Failed to get user info"))
        }
    }

    @GetMapping("/cors-test")
    fun corsTest(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf(
            "message" to "CORS is working!",
            "timestamp" to System.currentTimeMillis(),
            "server" to "Spring Boot Backend",
            "headers" to "CORS headers should be present"
        ))
    }
} 