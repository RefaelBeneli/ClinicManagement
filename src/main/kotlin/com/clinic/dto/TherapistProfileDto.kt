package com.clinic.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

data class TherapistProfileRequest(
    val specialization: String? = null,
    
    @field:Positive(message = "Default rate must be positive")
    val defaultRate: BigDecimal? = null,
    
    @field:Min(value = 15, message = "Session duration must be at least 15 minutes")
    val defaultSessionDuration: Int = 60,
    
    val availableHours: String? = null,
    val bio: String? = null,
    val licenseNumber: String? = null,
    
    @field:Min(value = 0, message = "Years of experience cannot be negative")
    val yearsExperience: Int? = null,
    
    val education: String? = null,
    val certifications: String? = null,
    val languages: String? = null,
    val isAcceptingNewClients: Boolean = true,
    val profileImageUrl: String? = null,
    val phoneNumber: String? = null,
    val officeLocation: String? = null
)

data class TherapistProfileResponse(
    val id: Long,
    val userId: Long,
    val userFullName: String,
    val userEmail: String,
    val specialization: String?,
    val defaultRate: BigDecimal?,
    val defaultSessionDuration: Int,
    val availableHours: String?,
    val bio: String?,
    val licenseNumber: String?,
    val yearsExperience: Int?,
    val education: String?,
    val certifications: String?,
    val languages: String?,
    val isAcceptingNewClients: Boolean,
    val profileImageUrl: String?,
    val phoneNumber: String?,
    val officeLocation: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class UpdateTherapistProfileRequest(
    val specialization: String? = null,
    val defaultRate: BigDecimal? = null,
    val defaultSessionDuration: Int? = null,
    val availableHours: String? = null,
    val bio: String? = null,
    val licenseNumber: String? = null,
    val yearsExperience: Int? = null,
    val education: String? = null,
    val certifications: String? = null,
    val languages: String? = null,
    val isAcceptingNewClients: Boolean? = null,
    val profileImageUrl: String? = null,
    val phoneNumber: String? = null,
    val officeLocation: String? = null
)

// Simplified DTO for therapist directory listings
data class TherapistDirectoryResponse(
    val id: Long,
    val userId: Long,
    val fullName: String,
    val email: String,
    val specialization: String?,
    val yearsExperience: Int?,
    val languages: String?,
    val isAcceptingNewClients: Boolean,
    val bio: String?
) 