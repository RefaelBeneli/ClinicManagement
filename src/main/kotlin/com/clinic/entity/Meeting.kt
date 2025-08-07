package com.clinic.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "meetings")
data class Meeting(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    val client: Client,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Column(name = "meeting_date", nullable = false)
    val meetingDate: LocalDateTime,
    
    @Column(nullable = false)
    val duration: Int = 60, // Duration in minutes
    
    @Column(nullable = false, precision = 10, scale = 2)
    val price: BigDecimal,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: MeetingStatus = MeetingStatus.SCHEDULED,
    
    @Column(name = "is_paid", nullable = false)
    val isPaid: Boolean = false,
    
    @Column(name = "payment_date", nullable = true)
    val paymentDate: LocalDateTime? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_type_id", nullable = true)
    val paymentType: PaymentType? = null,
    
    @Column(nullable = true, length = 1000)
    val notes: String? = null,
    
    @Column(nullable = true, columnDefinition = "TEXT")
    val summary: String? = null,
    
    @Column(name = "google_event_id", nullable = true)
    val googleEventId: String? = null,
    
    // Recurring meeting fields
    @Column(name = "is_recurring", nullable = false)
    val isRecurring: Boolean = false,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_frequency", nullable = true)
    val recurrenceFrequency: RecurrenceFrequency? = null,
    
    @Column(name = "total_sessions", nullable = true)
    val totalSessions: Int? = null,
    
    @Column(name = "session_number", nullable = false)
    val sessionNumber: Int = 1,
    
    @Column(name = "parent_meeting_id", nullable = true)
    val parentMeetingId: Long? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true
)

enum class MeetingStatus {
    SCHEDULED,
    COMPLETED,
    CANCELLED,
    NO_SHOW
}

enum class RecurrenceFrequency {
    WEEKLY,
    BIWEEKLY,
    MONTHLY
} 