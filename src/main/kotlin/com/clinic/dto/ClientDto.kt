package com.clinic.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class ClientRequest(
    @field:NotBlank(message = "Client name is required")
    val fullName: String,
    val email: String? = null,
    val phone: String? = null,
    val dateOfBirth: String? = null,
    val notes: String? = null
)

data class ClientResponse(
    val id: Long,
    val fullName: String,
    val email: String?,
    val phone: String?,
    val dateOfBirth: String?,
    val notes: String?,
    val createdAt: LocalDateTime,
    val isActive: Boolean
)

data class UpdateClientRequest(
    val fullName: String?,
    val email: String?,
    val phone: String?,
    val dateOfBirth: String?,
    val notes: String?,
    val isActive: Boolean?
) 