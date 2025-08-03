package com.clinic.dto

import java.time.LocalDateTime

data class CalendarIntegrationResponse(
    val id: Long,
    val userId: Long,
    val googleCalendarId: String?,
    val clientSessionCalendar: String?,
    val personalMeetingCalendar: String?,
    val syncEnabled: Boolean,
    val syncClientSessions: Boolean,
    val syncPersonalMeetings: Boolean,
    val lastSyncDate: LocalDateTime?,
    val isConnected: Boolean,
    val tokenExpiry: LocalDateTime?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class CalendarIntegrationRequest(
    val syncEnabled: Boolean = true,
    val syncClientSessions: Boolean = true,
    val syncPersonalMeetings: Boolean = true,
    val clientSessionCalendar: String? = null,
    val personalMeetingCalendar: String? = null
)

data class UpdateCalendarIntegrationRequest(
    val syncEnabled: Boolean? = null,
    val syncClientSessions: Boolean? = null,
    val syncPersonalMeetings: Boolean? = null,
    val clientSessionCalendar: String? = null,
    val personalMeetingCalendar: String? = null
)

data class OAuthUrlResponse(
    val authorizationUrl: String,
    val state: String
)

data class OAuthCallbackRequest(
    val code: String,
    val state: String
)

data class CalendarSyncStatusResponse(
    val isConnected: Boolean,
    val lastSyncDate: LocalDateTime?,
    val syncEnabled: Boolean,
    val pendingEvents: Int,
    val syncErrors: List<String> = emptyList()
)

data class CalendarEventResponse(
    val id: String,
    val summary: String,
    val start: LocalDateTime,
    val end: LocalDateTime,
    val description: String?,
    val location: String?
)

data class CalendarListResponse(
    val calendars: List<CalendarResponse>
)

data class GoogleCalendarEventResponse(
    val id: String,
    val summary: String?,
    val description: String?,
    val start: com.google.api.services.calendar.model.EventDateTime,
    val end: com.google.api.services.calendar.model.EventDateTime,
    val location: String?,
    val attendees: List<GoogleCalendarAttendeeResponse>?,
    val organizer: GoogleCalendarOrganizerResponse?
)

data class GoogleCalendarAttendeeResponse(
    val email: String,
    val displayName: String?,
    val responseStatus: String?
)

data class GoogleCalendarOrganizerResponse(
    val email: String,
    val displayName: String?
)

data class CalendarConflictResponse(
    val startTime: Long,
    val endTime: Long,
    val conflictingEvents: List<String>,
    val severity: String
)

data class CalendarResponse(
    val id: String,
    val summary: String,
    val description: String?,
    val primary: Boolean = false
) 