package com.clinic.dto

import com.clinic.entity.PersonalMeetingType
import java.math.BigDecimal
import java.time.LocalDateTime

// User Management DTOs
data class AdminUserResponse(
    val id: Long,
    val username: String,
    val email: String,
    val fullName: String,
    val role: String,
    val enabled: Boolean,
    val createdAt: LocalDateTime
)

data class UpdateUserRequest(
    val email: String? = null,
    val fullName: String? = null,
    val role: String? = null,
    val enabled: Boolean? = null
)

// Client Management DTOs
data class AdminClientResponse(
    val id: Long,
    val fullName: String,
    val email: String?,
    val phone: String?,
    val notes: String?,
    val isActive: Boolean,
    val userId: Long,
    val userFullName: String,
    val createdAt: LocalDateTime
)

data class AdminClientRequest(
    val fullName: String,
    val email: String? = null,
    val phone: String? = null,
    val notes: String? = null,
    val isActive: Boolean = true,
    val userId: Long
)

// Meeting Management DTOs
data class AdminMeetingResponse(
    val id: Long,
    val clientId: Long,
    val clientName: String,
    val userId: Long,
    val userFullName: String,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    val isPaid: Boolean,
    val paymentDate: LocalDateTime?,
    val status: String,
    val notes: String?,
    val createdAt: LocalDateTime
)

data class AdminMeetingRequest(
    val clientId: Long,
    val userId: Long,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    val isPaid: Boolean = false,
    val paymentDate: LocalDateTime? = null,
    val status: String = "SCHEDULED",
    val notes: String? = null
)

// Personal Meeting Management DTOs
data class AdminPersonalMeetingResponse(
    val id: Long,
    val userId: Long,
    val userFullName: String,
    val therapistName: String,
    val meetingType: String,
    val providerType: String,
    val providerCredentials: String?,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    val isPaid: Boolean,
    val paymentDate: LocalDateTime?,
    val status: String,
    val notes: String?,
    val createdAt: LocalDateTime
)

data class AdminPersonalMeetingRequest(
    val userId: Long,
    val therapistName: String,
    val meetingType: String = "PERSONAL_THERAPY",
    val providerType: String = "Therapist",
    val providerCredentials: String? = null,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    val isPaid: Boolean = false,
    val paymentDate: LocalDateTime? = null,
    val status: String = "SCHEDULED",
    val notes: String? = null
) 