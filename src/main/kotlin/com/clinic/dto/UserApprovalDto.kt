package com.clinic.dto

import com.clinic.entity.UserApprovalStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

data class PendingUserResponse(
    val id: Long,
    val username: String,
    val email: String,
    val fullName: String,
    val createdAt: LocalDateTime,
    val approvalStatus: UserApprovalStatus
)

data class UserApprovalRequest(
    @field:NotNull(message = "User ID is required")
    val userId: Long,
    
    val reason: String? = null
)

data class UserRejectionRequest(
    @field:NotNull(message = "User ID is required")
    val userId: Long,
    
    @field:NotBlank(message = "Rejection reason is required")
    val reason: String
)

data class UserApprovalResponse(
    val id: Long,
    val username: String,
    val email: String,
    val fullName: String,
    val approvalStatus: UserApprovalStatus,
    val approvedBy: String? = null,
    val approvedDate: LocalDateTime? = null,
    val rejectionReason: String? = null,
    val createdAt: LocalDateTime
)

data class ApprovalHistoryResponse(
    val id: Long,
    val username: String,
    val email: String,
    val fullName: String,
    val approvalStatus: UserApprovalStatus,
    val approvedBy: String? = null,
    val approvedDate: LocalDateTime? = null,
    val rejectionReason: String? = null,
    val createdAt: LocalDateTime
) 