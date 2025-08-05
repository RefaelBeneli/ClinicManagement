package com.clinic.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

data class PaymentTypeRequest(
    @field:NotNull(message = "Name is required")
    val name: String
)

data class UpdatePaymentTypeRequest(
    val name: String?,
    @JsonProperty("isActive")
    val isActive: Boolean?
)

data class PaymentTypeResponse(
    val id: Long,
    val name: String,
    @JsonProperty("isActive")
    val isActive: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) 