package com.clinic.dto

import com.clinic.entity.PersonalMeetingStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

data class PersonalMeetingRequest(
    @field:NotBlank(message = "Therapist name is required")
    val therapistName: String,
    
    @field:NotNull(message = "Meeting date is required")
    val meetingDate: LocalDateTime,
    
    val duration: Int = 60,
    
    @field:NotNull(message = "Price is required")
    @field:Positive(message = "Price must be positive")
    val price: BigDecimal,
    
    val notes: String? = null
)

data class PersonalMeetingResponse(
    val id: Long,
    val therapistName: String,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    val isPaid: Boolean,
    val paymentDate: LocalDateTime?,
    val notes: String?,
    val status: PersonalMeetingStatus,
    val createdAt: LocalDateTime
)

data class UpdatePersonalMeetingRequest(
    val therapistName: String?,
    val meetingDate: LocalDateTime?,
    val duration: Int?,
    val price: BigDecimal?,
    val isPaid: Boolean?,
    val notes: String?,
    val status: PersonalMeetingStatus?
) 