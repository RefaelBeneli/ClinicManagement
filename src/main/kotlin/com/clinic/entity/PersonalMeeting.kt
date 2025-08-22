package com.clinic.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "personal_meetings")
data class PersonalMeeting(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Column(name = "therapist_name", nullable = false)
    val therapistName: String,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_type_id", nullable = false)
    val meetingType: PersonalMeetingType,
    
    @Column(name = "provider_type", nullable = false)
    val providerType: String = "Therapist", // "Therapist", "Guide", "Supervisor", "Teacher", etc.
    
    @Column(name = "provider_credentials", nullable = true)
    val providerCredentials: String? = null,
    
    @Column(name = "meeting_date", nullable = false)
    val meetingDate: LocalDateTime,
    
    @Column(nullable = false)
    val duration: Int = 60, // Duration in minutes
    
    @Column(nullable = false, precision = 10, scale = 2)
    val price: BigDecimal,
    
    @Column(name = "is_paid", nullable = false)
    val isPaid: Boolean = false,
    
    @Column(name = "payment_date", nullable = true)
    val paymentDate: LocalDateTime? = null,
    
    @Column(nullable = true, length = 1000)
    val notes: String? = null,
    
    @Column(nullable = true, columnDefinition = "TEXT")
    val summary: String? = null,
    
    @Column(name = "google_event_id", nullable = true)
    val googleEventId: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: PersonalMeetingStatus = PersonalMeetingStatus.SCHEDULED,
    
    @Column(name = "is_recurring", nullable = false)
    val isRecurring: Boolean = false,
    
    @Column(name = "recurrence_frequency", length = 50)
    val recurrenceFrequency: String? = null, // "weekly", "monthly", "quarterly"
    
    @Column(name = "next_due_date")
    val nextDueDate: LocalDate? = null,
    
    @Column(name = "total_sessions")
    val totalSessions: Int? = null, // Total number of sessions in the recurring series
    
    @Column(name = "session_number")
    val sessionNumber: Int? = null, // Which session number this is (1, 2, 3, etc.)
    
    @Column(name = "parent_meeting_id")
    val parentMeetingId: Long? = null, // Link to the parent recurring session
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true
)

enum class PersonalMeetingStatus {
    SCHEDULED,
    COMPLETED,
    CANCELLED,
    NO_SHOW
} 