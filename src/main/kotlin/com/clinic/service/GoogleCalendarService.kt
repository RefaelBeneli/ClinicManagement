package com.clinic.service

import com.clinic.dto.*
import com.clinic.entity.CalendarIntegration
import com.clinic.entity.Meeting
import com.clinic.entity.PersonalMeeting
import com.clinic.entity.User
import com.clinic.repository.CalendarIntegrationRepository
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.calendar.Calendar
import com.google.api.services.calendar.CalendarScopes
import com.google.api.services.calendar.model.Event
import com.google.api.services.calendar.model.EventDateTime
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.*

@Service
class GoogleCalendarService(
    private val calendarIntegrationRepository: CalendarIntegrationRepository
) {
    
    @Value("\${google.oauth.client-id:#{null}}")
    private val clientId: String? = null
    
    @Value("\${google.oauth.client-secret:#{null}}")
    private val clientSecret: String? = null
    
    @Value("\${google.oauth.redirect-uri:http://localhost:3000/calendar/callback}")
    private val redirectUri: String = "http://localhost:3000/calendar/callback"
    
    private val jsonFactory = GsonFactory.getDefaultInstance()
    private val httpTransport: NetHttpTransport = GoogleNetHttpTransport.newTrustedTransport()
    private val scopes = listOf(CalendarScopes.CALENDAR)
    
    fun generateAuthorizationUrl(userId: Long): OAuthUrlResponse {
        if (clientId.isNullOrBlank() || clientSecret.isNullOrBlank()) {
            throw RuntimeException("Google OAuth credentials not configured")
        }
        
        val flow = GoogleAuthorizationCodeFlow.Builder(
            httpTransport, jsonFactory, clientId, clientSecret, scopes
        )
            .setAccessType("offline")
            .setApprovalPrompt("force")
            .build()
        
        val state = UUID.randomUUID().toString()
        val authorizationUrl = flow.newAuthorizationUrl()
            .setRedirectUri(redirectUri)
            .setState("$userId:$state")
            .build()
        
        return OAuthUrlResponse(
            authorizationUrl = authorizationUrl,
            state = state
        )
    }
    
    fun handleOAuthCallback(code: String, state: String, user: User): CalendarIntegration {
        if (clientId.isNullOrBlank() || clientSecret.isNullOrBlank()) {
            throw RuntimeException("Google OAuth credentials not configured")
        }
        
        val flow = GoogleAuthorizationCodeFlow.Builder(
            httpTransport, jsonFactory, clientId, clientSecret, scopes
        )
            .setAccessType("offline")
            .setApprovalPrompt("force")
            .build()
        
        val tokenResponse = flow.newTokenRequest(code)
            .setRedirectUri(redirectUri)
            .execute()
        
        val credential = GoogleCredential.Builder()
            .setTransport(httpTransport)
            .setJsonFactory(jsonFactory)
            .setClientSecrets(clientId, clientSecret)
            .build()
            .setFromTokenResponse(tokenResponse)
        
        // Get primary calendar ID
        val calendarService = Calendar.Builder(httpTransport, jsonFactory, credential)
            .setApplicationName("Clinic Management System")
            .build()
        
        val primaryCalendar = calendarService.calendars().get("primary").execute()
        
        // Save or update integration
        val existingIntegration = calendarIntegrationRepository.findByUser(user)
        val integration = if (existingIntegration.isPresent) {
            existingIntegration.get().copy(
                googleCalendarId = primaryCalendar.id,
                accessToken = credential.accessToken,
                refreshToken = credential.refreshToken,
                tokenExpiry = if (credential.expirationTimeMilliseconds != null) {
                    LocalDateTime.ofInstant(
                        java.time.Instant.ofEpochMilli(credential.expirationTimeMilliseconds),
                        ZoneId.systemDefault()
                    )
                } else null,
                updatedAt = LocalDateTime.now()
            )
        } else {
            CalendarIntegration(
                user = user,
                googleCalendarId = primaryCalendar.id,
                accessToken = credential.accessToken,
                refreshToken = credential.refreshToken,
                tokenExpiry = if (credential.expirationTimeMilliseconds != null) {
                    LocalDateTime.ofInstant(
                        java.time.Instant.ofEpochMilli(credential.expirationTimeMilliseconds),
                        ZoneId.systemDefault()
                    )
                } else null
            )
        }
        
        return calendarIntegrationRepository.save(integration)
    }
    
    fun createCalendarEvent(meeting: Meeting, integration: CalendarIntegration): String? {
        try {
            val calendarService = buildCalendarService(integration) ?: return null
            
            val event = Event().apply {
                summary = "Client Session: ${meeting.client.fullName}"
                description = buildString {
                    append("Client: ${meeting.client.fullName}\n")
                    append("Duration: ${meeting.duration} minutes\n")
                    append("Price: $${meeting.price}\n")
                    if (!meeting.notes.isNullOrBlank()) {
                        append("Notes: ${meeting.notes}\n")
                    }
                }
                
                start = EventDateTime().setDateTime(
                    com.google.api.client.util.DateTime(
                        meeting.meetingDate.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    )
                )
                
                end = EventDateTime().setDateTime(
                    com.google.api.client.util.DateTime(
                        meeting.meetingDate.plusMinutes(meeting.duration.toLong())
                            .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    )
                )
            }
            
            val calendarId = integration.clientSessionCalendar ?: integration.googleCalendarId ?: "primary"
            val createdEvent = calendarService.events().insert(calendarId, event).execute()
            
            return createdEvent.id
        } catch (e: Exception) {
            println("Error creating calendar event for meeting ${meeting.id}: ${e.message}")
            return null
        }
    }
    
    fun createCalendarEvent(personalMeeting: PersonalMeeting, integration: CalendarIntegration): String? {
        try {
            val calendarService = buildCalendarService(integration) ?: return null
            
            val event = Event().apply {
                summary = "${personalMeeting.meetingType.name.replace("_", " ").lowercase().replaceFirstChar { it.uppercase() }}: ${personalMeeting.therapistName}"
                description = buildString {
                    append("Type: ${personalMeeting.meetingType.name.replace("_", " ")}\n")
                    append("Provider: ${personalMeeting.therapistName}\n")
                    append("Provider Type: ${personalMeeting.providerType}\n")
                    if (!personalMeeting.providerCredentials.isNullOrBlank()) {
                        append("Credentials: ${personalMeeting.providerCredentials}\n")
                    }
                    append("Duration: ${personalMeeting.duration} minutes\n")
                    append("Price: $${personalMeeting.price}\n")
                    if (!personalMeeting.notes.isNullOrBlank()) {
                        append("Notes: ${personalMeeting.notes}\n")
                    }
                }
                
                start = EventDateTime().setDateTime(
                    com.google.api.client.util.DateTime(
                        personalMeeting.meetingDate.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    )
                )
                
                end = EventDateTime().setDateTime(
                    com.google.api.client.util.DateTime(
                        personalMeeting.meetingDate.plusMinutes(personalMeeting.duration.toLong())
                            .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    )
                )
            }
            
            val calendarId = integration.personalMeetingCalendar ?: integration.googleCalendarId ?: "primary"
            val createdEvent = calendarService.events().insert(calendarId, event).execute()
            
            return createdEvent.id
        } catch (e: Exception) {
            println("Error creating calendar event for personal meeting ${personalMeeting.id}: ${e.message}")
            return null
        }
    }
    
    fun updateCalendarEvent(googleEventId: String, meeting: Meeting, integration: CalendarIntegration): Boolean {
        try {
            val calendarService = buildCalendarService(integration) ?: return false
            
            val calendarId = integration.clientSessionCalendar ?: integration.googleCalendarId ?: "primary"
            val existingEvent = calendarService.events().get(calendarId, googleEventId).execute()
            
            existingEvent.apply {
                summary = "Client Session: ${meeting.client.fullName}"
                description = buildString {
                    append("Client: ${meeting.client.fullName}\n")
                    append("Duration: ${meeting.duration} minutes\n")
                    append("Price: $${meeting.price}\n")
                    if (!meeting.notes.isNullOrBlank()) {
                        append("Notes: ${meeting.notes}\n")
                    }
                }
                
                start = EventDateTime().setDateTime(
                    com.google.api.client.util.DateTime(
                        meeting.meetingDate.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    )
                )
                
                end = EventDateTime().setDateTime(
                    com.google.api.client.util.DateTime(
                        meeting.meetingDate.plusMinutes(meeting.duration.toLong())
                            .atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                    )
                )
            }
            
            calendarService.events().update(calendarId, googleEventId, existingEvent).execute()
            return true
        } catch (e: Exception) {
            println("Error updating calendar event $googleEventId: ${e.message}")
            return false
        }
    }
    
    fun deleteCalendarEvent(googleEventId: String, integration: CalendarIntegration): Boolean {
        try {
            val calendarService = buildCalendarService(integration) ?: return false
            
            val calendarId = integration.googleCalendarId ?: "primary"
            calendarService.events().delete(calendarId, googleEventId).execute()
            return true
        } catch (e: Exception) {
            println("Error deleting calendar event $googleEventId: ${e.message}")
            return false
        }
    }
    
    fun getUserCalendars(integration: CalendarIntegration): List<CalendarResponse> {
        try {
            val calendarService = buildCalendarService(integration) ?: return emptyList()
            
            val calendarList = calendarService.calendarList().list().execute()
            
            return calendarList.items.map { calendar ->
                CalendarResponse(
                    id = calendar.id,
                    summary = calendar.summary,
                    description = calendar.description,
                    primary = calendar.primary ?: false
                )
            }
        } catch (e: Exception) {
            println("Error fetching user calendars: ${e.message}")
            return emptyList()
        }
    }
    
    private fun buildCalendarService(integration: CalendarIntegration): Calendar? {
        try {
            if (integration.accessToken.isNullOrBlank()) {
                return null
            }
            
            val credential = GoogleCredential.Builder()
                .setTransport(httpTransport)
                .setJsonFactory(jsonFactory)
                .setClientSecrets(clientId, clientSecret)
                .build()
                .setAccessToken(integration.accessToken)
                .setRefreshToken(integration.refreshToken)
            
            return Calendar.Builder(httpTransport, jsonFactory, credential)
                .setApplicationName("Clinic Management System")
                .build()
        } catch (e: Exception) {
            println("Error building calendar service: ${e.message}")
            return null
        }
    }
} 