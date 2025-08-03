package com.clinic.controller

import com.clinic.dto.*
import com.clinic.service.AuthService
import com.clinic.service.CalendarIntegrationService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/calendar")
class CalendarIntegrationController(
    private val calendarIntegrationService: CalendarIntegrationService,
    private val authService: AuthService
) {
    
    @GetMapping("/integration")
    fun getUserIntegration(): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val integration = calendarIntegrationService.getUserIntegration(user.id)
            
            if (integration != null) {
                ResponseEntity.ok(integration)
            } else {
                ResponseEntity.ok(mapOf("message" to "No calendar integration found"))
            }
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting integration: ${e.message}"))
        }
    }
    
    @PostMapping("/integration")
    fun createIntegration(@Valid @RequestBody request: CalendarIntegrationRequest): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val integration = calendarIntegrationService.createIntegration(user.id, request)
            ResponseEntity.ok(integration)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error creating integration: ${e.message}"))
        }
    }
    
    @PatchMapping("/integration")
    fun updateIntegration(@Valid @RequestBody request: UpdateCalendarIntegrationRequest): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val integration = calendarIntegrationService.updateIntegration(user.id, request)
            ResponseEntity.ok(integration)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error updating integration: ${e.message}"))
        }
    }
    
    @DeleteMapping("/integration")
    fun disconnectIntegration(): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val success = calendarIntegrationService.disconnectIntegration(user.id)
            
            if (success) {
                ResponseEntity.ok(MessageResponse("Calendar integration disconnected successfully"))
            } else {
                ResponseEntity.badRequest().body(MessageResponse("Failed to disconnect integration"))
            }
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error disconnecting integration: ${e.message}"))
        }
    }
    
    @GetMapping("/auth-url")
    fun getAuthorizationUrl(): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val authUrl = calendarIntegrationService.generateAuthUrl(user.id)
            ResponseEntity.ok(authUrl)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error generating auth URL: ${e.message}"))
        }
    }
    
    @PostMapping("/oauth/callback")
    fun handleOAuthCallback(@Valid @RequestBody request: OAuthCallbackRequest): ResponseEntity<*> {
        return try {
            val integration = calendarIntegrationService.handleOAuthCallback(request)
            ResponseEntity.ok(integration)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error handling OAuth callback: ${e.message}"))
        }
    }
    
    @GetMapping("/status")
    fun getSyncStatus(): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val status = calendarIntegrationService.getSyncStatus(user.id)
            ResponseEntity.ok(status)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting sync status: ${e.message}"))
        }
    }
    
    @GetMapping("/calendars")
    fun getUserCalendars(): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val calendars = calendarIntegrationService.getUserCalendars(user.id)
            ResponseEntity.ok(calendars)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting calendars: ${e.message}"))
        }
    }
    
    @PostMapping("/sync/enable")
    fun enableSync(): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val integration = calendarIntegrationService.enableSync(user.id)
            ResponseEntity.ok(integration)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error enabling sync: ${e.message}"))
        }
    }
    
    @PostMapping("/sync/disable")
    fun disableSync(): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val integration = calendarIntegrationService.disableSync(user.id)
            ResponseEntity.ok(integration)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error disabling sync: ${e.message}"))
        }
    }

    @GetMapping("/events")
    fun getCalendarEvents(
        @RequestParam startDate: String,
        @RequestParam endDate: String
    ): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val events = calendarIntegrationService.getCalendarEvents(user.id, startDate, endDate)
            ResponseEntity.ok(events)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting calendar events: ${e.message}"))
        }
    }

    @GetMapping("/conflicts")
    fun checkConflicts(
        @RequestParam startDate: String,
        @RequestParam endDate: String
    ): ResponseEntity<*> {
        return try {
            val user = authService.getCurrentUser()
            val conflicts = calendarIntegrationService.checkConflicts(user.id, startDate, endDate)
            ResponseEntity.ok(conflicts)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error checking conflicts: ${e.message}"))
        }
    }
} 