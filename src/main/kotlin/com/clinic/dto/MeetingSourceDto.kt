package com.clinic.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

data class ClientSourceRequest(
    @field:NotBlank(message = "Source name is required")
    val name: String,
    
    @field:NotNull(message = "Duration is required")
    @field:Positive(message = "Duration must be positive")
    val duration: Int,
    
    @field:NotNull(message = "Price is required")
    val price: BigDecimal,
    
    @field:NotNull(message = "No-show price is required")
    val noShowPrice: BigDecimal
)

data class ClientSourceResponse(
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

data class UpdateClientSourceRequest(
    val name: String?,
    val duration: Int?,
    val price: BigDecimal?,
    val noShowPrice: BigDecimal?,
    @JsonProperty("isActive")
    val isActive: Boolean?
) 