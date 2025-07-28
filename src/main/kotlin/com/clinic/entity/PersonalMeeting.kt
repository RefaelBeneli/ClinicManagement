package com.clinic.entity

import jakarta.persistence.*
import java.math.BigDecimal
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
    
    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_type", nullable = false)
    val meetingType: PersonalMeetingType = PersonalMeetingType.PERSONAL_THERAPY,
    
    @Column(name = "provider_type", nullable = false)
    val providerType: String = "Therapist", // "Therapist", "Supervisor", "Teacher", etc.
    
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
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: PersonalMeetingStatus = PersonalMeetingStatus.SCHEDULED,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

enum class PersonalMeetingType {
    PERSONAL_THERAPY,
    PROFESSIONAL_DEVELOPMENT,
    SUPERVISION,
    TEACHING_SESSION
}

enum class PersonalMeetingStatus {
    SCHEDULED,
    COMPLETED,
    CANCELLED,
    NO_SHOW
} 