package com.clinic.dto

import com.clinic.entity.MeetingStatus
import com.clinic.entity.RecurrenceFrequency
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

data class MeetingRequest(
    @field:NotNull(message = "Client ID is required")
    val clientId: Long,
    
    @field:NotNull(message = "Meeting date is required")
    val meetingDate: LocalDateTime,
    
    val duration: Int = 60,
    
    val price: BigDecimal? = null, // Optional, will use client's source default if not provided
    
    val notes: String? = null,
    
    val summary: String? = null,
    
    // Recurring meeting fields
    val isRecurring: Boolean = false,
    
    val recurrenceFrequency: RecurrenceFrequency? = null,
    
    val totalSessions: Int? = null
)

data class MeetingResponse(
    val id: Long,
    val client: ClientResponse,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    @JsonProperty("isPaid")
    val isPaid: Boolean,
    val paymentDate: LocalDateTime?,
    val paymentType: PaymentTypeResponse?,
    val notes: String?,
    val summary: String?,
    val status: MeetingStatus,
    val isRecurring: Boolean,
    val recurrenceFrequency: RecurrenceFrequency?,
    val totalSessions: Int?,
    val sessionNumber: Int,
    val parentMeetingId: Long?,
    val createdAt: LocalDateTime,
    @JsonProperty("isActive")
    val isActive: Boolean
)

data class UpdateMeetingRequest(
    val clientId: Long?,
    val meetingDate: LocalDateTime?,
    val duration: Int?,
    val price: BigDecimal?,
    @JsonProperty("isPaid")
    val isPaid: Boolean?,
    val paymentDate: LocalDateTime?,
    val paymentTypeId: Long?,
    val notes: String?,
    val summary: String?,
    val status: MeetingStatus?
)

data class PaymentUpdateRequest(
    @field:NotNull(message = "Payment status is required")
    @JsonProperty("isPaid")
    val isPaid: Boolean,
    val paymentDate: LocalDateTime? = if (isPaid == true) LocalDateTime.now() else null
)

// Revenue tracking DTOs
data class RevenueStatsRequest(
    val period: String, // "daily", "monthly", "yearly", "custom"
    val startDate: LocalDateTime? = null,
    val endDate: LocalDateTime? = null
)

data class RevenueResponse(
    val totalRevenue: BigDecimal,
    val paidRevenue: BigDecimal,
    val unpaidRevenue: BigDecimal,
    val totalMeetings: Int,
    val paidMeetings: Int,
    val unpaidMeetings: Int,
    val completedMeetings: Int,
    val period: String,
    val startDate: LocalDateTime,
    val endDate: LocalDateTime
) 