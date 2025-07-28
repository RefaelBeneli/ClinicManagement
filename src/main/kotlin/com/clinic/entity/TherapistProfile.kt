package com.clinic.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "therapist_profiles")
data class TherapistProfile(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: User,
    
    @Column(name = "specialization", nullable = true)
    val specialization: String? = null,
    
    @Column(name = "default_rate", nullable = true, precision = 10, scale = 2)
    val defaultRate: BigDecimal? = null,
    
    @Column(name = "default_session_duration", nullable = false)
    val defaultSessionDuration: Int = 60, // Duration in minutes
    
    @Column(name = "available_hours", nullable = true, length = 1000)
    val availableHours: String? = null, // JSON string for availability schedule
    
    @Column(name = "bio", nullable = true, length = 2000)
    val bio: String? = null,
    
    @Column(name = "license_number", nullable = true)
    val licenseNumber: String? = null,
    
    @Column(name = "years_experience", nullable = true)
    val yearsExperience: Int? = null,
    
    @Column(name = "education", nullable = true, length = 1000)
    val education: String? = null,
    
    @Column(name = "certifications", nullable = true, length = 1000)
    val certifications: String? = null,
    
    @Column(name = "languages", nullable = true)
    val languages: String? = null, // Comma-separated list
    
    @Column(name = "is_accepting_new_clients", nullable = false)
    val isAcceptingNewClients: Boolean = true,
    
    @Column(name = "profile_image_url", nullable = true)
    val profileImageUrl: String? = null,
    
    @Column(name = "phone_number", nullable = true)
    val phoneNumber: String? = null,
    
    @Column(name = "office_location", nullable = true)
    val officeLocation: String? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 