package com.clinic.dto

import com.clinic.entity.MeetingStatus
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
    
    @field:NotNull(message = "Price is required")
    @field:Positive(message = "Price must be positive")
    val price: BigDecimal,
    
    val notes: String? = null
)

data class MeetingResponse(
    val id: Long,
    val client: ClientResponse,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    val isPaid: Boolean,
    val paymentDate: LocalDateTime?,
    val notes: String?,
    val status: MeetingStatus,
    val createdAt: LocalDateTime
)

data class UpdateMeetingRequest(
    val clientId: Long?,
    val meetingDate: LocalDateTime?,
    val duration: Int?,
    val price: BigDecimal?,
    val isPaid: Boolean?,
    val notes: String?,
    val status: MeetingStatus?
)

data class PaymentUpdateRequest(
    @field:NotNull(message = "Payment status is required")
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