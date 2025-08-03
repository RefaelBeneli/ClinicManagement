package com.clinic.service

import com.clinic.dto.*
import com.clinic.entity.CalendarIntegration
import com.clinic.entity.User
import com.clinic.repository.CalendarIntegrationRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class CalendarIntegrationService(
    private val calendarIntegrationRepository: CalendarIntegrationRepository,
    private val googleCalendarService: GoogleCalendarService,
    private val authService: AuthService
) {
    
    fun getUserIntegration(userId: Long): CalendarIntegrationResponse? {
        val user = authService.getUserById(userId) ?: return null
        val integration = calendarIntegrationRepository.findByUser(user).orElse(null) ?: return null
        
        return mapToResponse(integration)
    }
    
    fun createIntegration(userId: Long, request: CalendarIntegrationRequest): CalendarIntegrationResponse {
        val user = authService.getUserById(userId) 
            ?: throw RuntimeException("User not found")
        
        val integration = CalendarIntegration(
            user = user,
            syncEnabled = request.syncEnabled,
            syncClientSessions = request.syncClientSessions,
            syncPersonalMeetings = request.syncPersonalMeetings,
            clientSessionCalendar = request.clientSessionCalendar,
            personalMeetingCalendar = request.personalMeetingCalendar
        )
        
        val savedIntegration = calendarIntegrationRepository.save(integration)
        return mapToResponse(savedIntegration)
    }
    
    fun updateIntegration(userId: Long, request: UpdateCalendarIntegrationRequest): CalendarIntegrationResponse {
        val user = authService.getUserById(userId) 
            ?: throw RuntimeException("User not found")
        
        val existingIntegration = calendarIntegrationRepository.findByUser(user)
            .orElseThrow { RuntimeException("Calendar integration not found") }
        
        val updatedIntegration = existingIntegration.copy(
            syncEnabled = request.syncEnabled ?: existingIntegration.syncEnabled,
            syncClientSessions = request.syncClientSessions ?: existingIntegration.syncClientSessions,
            syncPersonalMeetings = request.syncPersonalMeetings ?: existingIntegration.syncPersonalMeetings,
            clientSessionCalendar = request.clientSessionCalendar ?: existingIntegration.clientSessionCalendar,
            personalMeetingCalendar = request.personalMeetingCalendar ?: existingIntegration.personalMeetingCalendar,
            updatedAt = LocalDateTime.now()
        )
        
        val savedIntegration = calendarIntegrationRepository.save(updatedIntegration)
        return mapToResponse(savedIntegration)
    }
    
    fun disconnectIntegration(userId: Long): Boolean {
        val user = authService.getUserById(userId) ?: return false
        
        val integration = calendarIntegrationRepository.findByUser(user).orElse(null) ?: return false
        
        calendarIntegrationRepository.delete(integration)
        return true
    }
    
    fun generateAuthUrl(userId: Long): OAuthUrlResponse {
        return try {
            googleCalendarService.generateAuthorizationUrl(userId)
        } catch (e: RuntimeException) {
            if (e.message?.contains("disabled") == true) {
                throw RuntimeException("Google Calendar integration is disabled")
            }
            throw e
        }
    }
    
    fun handleOAuthCallback(request: OAuthCallbackRequest): CalendarIntegrationResponse {
        return try {
            // Extract userId from state (format: "userId:randomState")
            val stateParts = request.state.split(":")
            if (stateParts.size != 2) {
                throw RuntimeException("Invalid state parameter")
            }
            
            val userId = stateParts[0].toLongOrNull() 
                ?: throw RuntimeException("Invalid user ID in state")
            
            val user = authService.getUserById(userId) 
                ?: throw RuntimeException("User not found")
            
            val integration = googleCalendarService.handleOAuthCallback(request.code, request.state, user)
            mapToResponse(integration)
        } catch (e: RuntimeException) {
            if (e.message?.contains("disabled") == true) {
                throw RuntimeException("Google Calendar integration is disabled")
            }
            throw e
        }
    }
    
    fun getSyncStatus(userId: Long): CalendarSyncStatusResponse {
        val user = authService.getUserById(userId) 
            ?: throw RuntimeException("User not found")
        
        val integration = calendarIntegrationRepository.findByUser(user).orElse(null)
        
        return if (integration != null && !integration.accessToken.isNullOrBlank()) {
            CalendarSyncStatusResponse(
                isConnected = true,
                lastSyncDate = integration.lastSyncDate,
                syncEnabled = integration.syncEnabled,
                pendingEvents = 0, // TODO: Implement pending events count
                syncErrors = emptyList() // TODO: Implement error tracking
            )
        } else {
            CalendarSyncStatusResponse(
                isConnected = false,
                lastSyncDate = null,
                syncEnabled = false,
                pendingEvents = 0,
                syncErrors = emptyList()
            )
        }
    }
    
    fun getUserCalendars(userId: Long): CalendarListResponse {
        val user = authService.getUserById(userId) 
            ?: throw RuntimeException("User not found")
        
        val integration = calendarIntegrationRepository.findByUser(user)
            .orElseThrow { RuntimeException("Calendar integration not found") }
        
        val calendars = googleCalendarService.getUserCalendars(integration)
        return CalendarListResponse(calendars)
    }
    
    fun enableSync(userId: Long): CalendarIntegrationResponse {
        return updateIntegration(userId, UpdateCalendarIntegrationRequest(syncEnabled = true))
    }
    
    fun disableSync(userId: Long): CalendarIntegrationResponse {
        return updateIntegration(userId, UpdateCalendarIntegrationRequest(syncEnabled = false))
    }
    
    fun getIntegrationByUser(user: User): CalendarIntegration? {
        return calendarIntegrationRepository.findByUser(user).orElse(null)
    }
    
    fun updateLastSyncDate(integration: CalendarIntegration): CalendarIntegration {
        val updatedIntegration = integration.copy(
            lastSyncDate = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        return calendarIntegrationRepository.save(updatedIntegration)
    }

    fun getCalendarEvents(userId: Long, startDate: String, endDate: String): List<GoogleCalendarEventResponse> {
        val user = authService.getUserById(userId) 
            ?: throw RuntimeException("User not found")
        
        val integration = calendarIntegrationRepository.findByUser(user).orElse(null)
        
        return if (integration != null && !integration.accessToken.isNullOrBlank()) {
            googleCalendarService.getCalendarEvents(integration, startDate, endDate)
        } else {
            emptyList()
        }
    }

    fun checkConflicts(userId: Long, startDate: String, endDate: String): List<CalendarConflictResponse> {
        val user = authService.getUserById(userId) 
            ?: throw RuntimeException("User not found")
        
        val integration = calendarIntegrationRepository.findByUser(user).orElse(null)
        
        return if (integration != null && !integration.accessToken.isNullOrBlank()) {
            googleCalendarService.checkConflicts(integration, startDate, endDate)
        } else {
            emptyList()
        }
    }
    
    private fun mapToResponse(integration: CalendarIntegration): CalendarIntegrationResponse {
        return CalendarIntegrationResponse(
            id = integration.id,
            userId = integration.user.id,
            googleCalendarId = integration.googleCalendarId,
            clientSessionCalendar = integration.clientSessionCalendar,
            personalMeetingCalendar = integration.personalMeetingCalendar,
            syncEnabled = integration.syncEnabled,
            syncClientSessions = integration.syncClientSessions,
            syncPersonalMeetings = integration.syncPersonalMeetings,
            lastSyncDate = integration.lastSyncDate,
            isConnected = !integration.accessToken.isNullOrBlank(),
            tokenExpiry = integration.tokenExpiry,
            createdAt = integration.createdAt,
            updatedAt = integration.updatedAt
        )
    }
} 