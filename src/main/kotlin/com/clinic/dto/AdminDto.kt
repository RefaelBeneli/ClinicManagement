package com.clinic.dto

import com.clinic.entity.PersonalMeetingType
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonAlias
import com.fasterxml.jackson.annotation.JsonProperty
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
    val approvalStatus: String,
    val approvedBy: String?,
    val approvedDate: LocalDateTime?,
    val rejectionReason: String?,
    val createdAt: LocalDateTime
)

data class UpdateUserRequest(
    val email: String? = null,
    val fullName: String? = null,
    val role: String? = null,
    val enabled: Boolean? = null
)

data class ApproveUserRequest(
    val approvalStatus: String,
    val rejectionReason: String? = null
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
    val userId: Long,
    val sourceId: Long
)

// Meeting Management DTOs
data class AdminMeetingResponse(
    val id: Long,
    val clientId: Long,
    val clientFullName: String,
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
    val sourceId: Long,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    val isPaid: Boolean = false,
    val paymentDate: LocalDateTime? = null,
    val paymentTypeId: Long? = null,
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
    val meetingTypeId: Long,
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

// Expense Management DTOs
data class AdminExpenseResponse(
    val id: Long,
    val userId: Long,
    val userFullName: String,
    val name: String,
    val description: String?,
    val amount: BigDecimal,
    val currency: String,
    val categoryId: Long,
    val categoryName: String,
    val notes: String?,
    val expenseDate: LocalDateTime,
    val isRecurring: Boolean,
    val recurrenceFrequency: String?,
    val recurrenceCount: Int?,
    val nextDueDate: LocalDateTime?,
    val isPaid: Boolean,
    val paymentTypeId: Long?,
    val paymentTypeName: String?,
    val receiptUrl: String?,
    val isActive: Boolean,
    val createdAt: LocalDateTime
)

data class AdminExpenseCreateRequest(
    val userId: Long,
    val name: String,
    val description: String? = null,
    val amount: BigDecimal,
    val currency: String = "ILS",
    val categoryId: Long,
    val notes: String? = null,
    val expenseDate: LocalDateTime,
    val isRecurring: Boolean = false,
    val recurrenceFrequency: String? = null,
    val recurrenceCount: Int? = null,
    val nextDueDate: LocalDateTime? = null,
    val isPaid: Boolean = false,
    val paymentTypeId: Long? = null,
    val receiptUrl: String? = null
)

data class AdminExpenseRequest(
    val userId: Long? = null,
    val name: String? = null,
    val description: String? = null,
    val amount: BigDecimal? = null,
    val currency: String? = null,
    val categoryId: Long? = null,
    val notes: String? = null,
    val expenseDate: LocalDateTime? = null,
    val isRecurring: Boolean? = null,
    val recurrenceFrequency: String? = null,
    val recurrenceCount: Int? = null,
    val nextDueDate: LocalDateTime? = null,
    val isPaid: Boolean? = null,
    val paymentTypeId: Long? = null,
    val receiptUrl: String? = null,
    val isActive: Boolean? = null
) 