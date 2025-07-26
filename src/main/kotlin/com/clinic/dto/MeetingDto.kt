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