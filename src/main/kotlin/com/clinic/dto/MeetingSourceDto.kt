package com.clinic.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

data class MeetingSourceRequest(
    @field:NotNull(message = "Name is required")
    val name: String,
    
    @field:NotNull(message = "Duration is required")
    @field:Positive(message = "Duration must be positive")
    val duration: Int,
    
    @field:NotNull(message = "Price is required")
    @field:Positive(message = "Price must be positive")
    val price: BigDecimal,
    
    @field:NotNull(message = "No-show price is required")
    @field:Positive(message = "No-show price must be positive")
    val noShowPrice: BigDecimal
)

data class UpdateMeetingSourceRequest(
    val name: String?,
    val duration: Int?,
    val price: BigDecimal?,
    val noShowPrice: BigDecimal?,
    @JsonProperty("isActive")
    val isActive: Boolean?
)

data class MeetingSourceResponse(
    val id: Long,
    val name: String,
    val duration: Int,
    val price: BigDecimal,
    val noShowPrice: BigDecimal,
    @JsonProperty("isActive")
    val isActive: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) 