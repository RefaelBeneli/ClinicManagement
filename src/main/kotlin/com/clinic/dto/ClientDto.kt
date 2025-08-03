package com.clinic.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class ClientRequest(
    @field:NotBlank(message = "Client name is required")
    val fullName: String,
    val email: String? = null,
    val phone: String? = null,
    val notes: String? = null
)

data class ClientResponse(
    val id: Long,
    val fullName: String,
    val email: String?,
    val phone: String?,
    val notes: String?,
    val createdAt: LocalDateTime,
    @JsonProperty("isActive")
    val isActive: Boolean
)

data class UpdateClientRequest(
    val fullName: String?,
    val email: String?,
    val phone: String?,
    val notes: String?,
    val isActive: Boolean?
) 