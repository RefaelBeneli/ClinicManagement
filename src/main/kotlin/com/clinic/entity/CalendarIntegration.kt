package com.clinic.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "calendar_integrations")
data class CalendarIntegration(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: User,
    
    @Column(name = "google_calendar_id", nullable = true)
    val googleCalendarId: String? = null,
    
    @Column(name = "access_token", nullable = true, length = 1000)
    val accessToken: String? = null,
    
    @Column(name = "refresh_token", nullable = true, length = 1000)
    val refreshToken: String? = null,
    
    @Column(name = "token_expiry", nullable = true)
    val tokenExpiry: LocalDateTime? = null,
    
    @Column(name = "client_session_calendar", nullable = true)
    val clientSessionCalendar: String? = null,
    
    @Column(name = "personal_meeting_calendar", nullable = true)
    val personalMeetingCalendar: String? = null,
    
    @Column(name = "sync_enabled", nullable = false)
    val syncEnabled: Boolean = true,
    
    @Column(name = "sync_client_sessions", nullable = false)
    val syncClientSessions: Boolean = true,
    
    @Column(name = "sync_personal_meetings", nullable = false)
    val syncPersonalMeetings: Boolean = true,
    
    @Column(name = "last_sync_date", nullable = true)
    val lastSyncDate: LocalDateTime? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 