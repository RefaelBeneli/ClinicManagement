package com.clinic.controller

import com.clinic.dto.AuthResponse
import com.clinic.dto.LoginRequest
import com.clinic.dto.MessageResponse
import com.clinic.dto.RegisterRequest
import com.clinic.service.AuthService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@CrossOrigin(origins = ["http://localhost:3000"], maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
class AuthController {

    @Autowired
    private lateinit var authService: AuthService

    @PostMapping("/signin")
    fun authenticateUser(@Valid @RequestBody loginRequest: LoginRequest): ResponseEntity<AuthResponse> {
        return try {
            val authResponse = authService.authenticateUser(loginRequest)
            ResponseEntity.ok(authResponse)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/signup")
    fun registerUser(@Valid @RequestBody registerRequest: RegisterRequest): ResponseEntity<MessageResponse> {
        return try {
            authService.registerUser(registerRequest)
            ResponseEntity.ok(MessageResponse("User registered successfully!"))
        } catch (e: RuntimeException) {
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
                "fullName" to user.fullName
            ))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Failed to get user info"))
        }
    }
} 