package com.clinic.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "personal_meeting_types")
data class PersonalMeetingType(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false, unique = true)
    val name: String, // "Personal Therapy", "Professional Development", "Supervision", "Teaching Session"
    
    @Column(nullable = false)
    val duration: Int = 60, // Default duration in minutes
    
    @Column(nullable = false, precision = 10, scale = 2)
    val price: BigDecimal, // Default price
    
    @Column(nullable = false)
    val isRecurring: Boolean = false, // Default recurrence setting
    
    @Column(name = "recurrence_frequency", length = 50)
    val recurrenceFrequency: String? = null, // "weekly", "monthly", "quarterly"
    
    @Column(nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 