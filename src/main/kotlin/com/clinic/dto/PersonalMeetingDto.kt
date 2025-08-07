package com.clinic.dto

import com.clinic.entity.PersonalMeetingStatus
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class PersonalMeetingRequest(
    @field:NotBlank(message = "Therapist name is required")
    val therapistName: String,
    
    @field:NotNull(message = "Meeting type ID is required")
    val meetingTypeId: Long,
    
    @field:NotBlank(message = "Provider type is required")
    val providerType: String = "Therapist",
    
    val providerCredentials: String? = null,
    
    @field:NotNull(message = "Meeting date is required")
    val meetingDate: LocalDateTime,
    
    val duration: Int = 60,
    
    @field:NotNull(message = "Price is required")
    @field:Positive(message = "Price must be positive")
    val price: BigDecimal,
    
    val notes: String? = null,
    
    val summary: String? = null,
    
    @JsonProperty("isRecurring")
    val isRecurring: Boolean = false,
    
    val recurrenceFrequency: String? = null, // "weekly", "monthly", "quarterly"
    
    val nextDueDate: LocalDate? = null
)

data class PersonalMeetingResponse(
    val id: Long,
    val therapistName: String,
    val meetingType: PersonalMeetingTypeResponse?,
    val providerType: String,
    val providerCredentials: String?,
    val meetingDate: LocalDateTime,
    val duration: Int,
    val price: BigDecimal,
    @JsonProperty("isPaid")
    val isPaid: Boolean,
    val paymentDate: LocalDateTime?,
    val notes: String?,
    val summary: String?,
    val status: PersonalMeetingStatus,
    @JsonProperty("isRecurring")
    val isRecurring: Boolean,
    val recurrenceFrequency: String?,
    val nextDueDate: LocalDate?,
    val createdAt: LocalDateTime,
    @JsonProperty("isActive")
    val isActive: Boolean
)

data class UpdatePersonalMeetingRequest(
    val therapistName: String?,
    val meetingTypeId: Long?,
    val providerType: String?,
    val providerCredentials: String?,
    val meetingDate: LocalDateTime?,
    val duration: Int?,
    val price: BigDecimal?,
    @JsonProperty("isPaid")
    val isPaid: Boolean?,
    val notes: String?,
    val summary: String?,
    val status: PersonalMeetingStatus?,
    @JsonProperty("isRecurring")
    val isRecurring: Boolean?,
    val recurrenceFrequency: String?,
    val nextDueDate: LocalDate?
)

data class PersonalMeetingPaymentUpdateRequest(
    @field:NotNull(message = "Payment status is required")
    @JsonProperty("isPaid")
    val isPaid: Boolean,
    val paymentDate: LocalDateTime? = if (isPaid == true) LocalDateTime.now() else null
) 