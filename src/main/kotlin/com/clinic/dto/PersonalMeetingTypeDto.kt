package com.clinic.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

data class PersonalMeetingTypeRequest(
    @field:NotNull(message = "Name is required")
    val name: String,
    
    @field:NotNull(message = "Duration is required")
    @field:Positive(message = "Duration must be positive")
    val duration: Int,
    
    @field:NotNull(message = "Price is required")
    @field:Positive(message = "Price must be positive")
    val price: BigDecimal,
    
    @JsonProperty("isRecurring")
    val isRecurring: Boolean = false,
    
    val recurrenceFrequency: String? = null
)

data class UpdatePersonalMeetingTypeRequest(
    val name: String?,
    val duration: Int?,
    val price: BigDecimal?,
    @JsonProperty("isRecurring")
    val isRecurring: Boolean?,
    val recurrenceFrequency: String?,
    @JsonProperty("isActive")
    val isActive: Boolean?
)

data class PersonalMeetingTypeResponse(
    val id: Long,
    val name: String,
    val duration: Int,
    val price: BigDecimal,
    @JsonProperty("isRecurring")
    val isRecurring: Boolean,
    val recurrenceFrequency: String?,
    @JsonProperty("isActive")
    val isActive: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) 