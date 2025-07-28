package com.clinic.controller

import com.clinic.dto.*
import com.clinic.service.UserApprovalService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
class UserApprovalController {

    @Autowired
    private lateinit var userApprovalService: UserApprovalService

    /**
     * Get all users pending approval
     */
    @GetMapping("/pending")
    fun getPendingUsers(): ResponseEntity<List<PendingUserResponse>> {
        val pendingUsers = userApprovalService.getPendingUsers()
        return ResponseEntity.ok(pendingUsers)
    }

    /**
     * Get count of pending users for dashboard notifications
     */
    @GetMapping("/pending/count")
    fun getPendingUsersCount(): ResponseEntity<Map<String, Long>> {
        val count = userApprovalService.getPendingUsersCount()
        return ResponseEntity.ok(mapOf("count" to count))
    }

    /**
     * Approve a user's registration
     */
    @PostMapping("/{userId}/approve")
    fun approveUser(
        @PathVariable userId: Long,
        @Valid @RequestBody request: UserApprovalRequest
    ): ResponseEntity<UserApprovalResponse> {
        try {
            val response = userApprovalService.approveUser(userId, request.reason)
            return ResponseEntity.ok(response)
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.notFound().build()
        } catch (e: IllegalStateException) {
            return ResponseEntity.badRequest().build()
        }
    }

    /**
     * Reject a user's registration
     */
    @PostMapping("/{userId}/reject")
    fun rejectUser(
        @PathVariable userId: Long,
        @Valid @RequestBody request: UserRejectionRequest
    ): ResponseEntity<UserApprovalResponse> {
        try {
            val response = userApprovalService.rejectUser(userId, request.reason)
            return ResponseEntity.ok(response)
        } catch (e: IllegalArgumentException) {
            return ResponseEntity.notFound().build()
        } catch (e: IllegalStateException) {
            return ResponseEntity.badRequest().build()
        }
    }

    /**
     * Get approval history for all users
     */
    @GetMapping("/approval-history")
    fun getApprovalHistory(): ResponseEntity<List<ApprovalHistoryResponse>> {
        val history = userApprovalService.getApprovalHistory()
        return ResponseEntity.ok(history)
    }

    /**
     * Get specific user's approval status
     */
    @GetMapping("/{userId}/status")
    fun getUserApprovalStatus(@PathVariable userId: Long): ResponseEntity<UserApprovalResponse> {
        try {
            // We can reuse the approval history logic for a single user
            val history = userApprovalService.getApprovalHistory()
            val userStatus = history.find { it.id == userId }
                ?: return ResponseEntity.notFound().build()

            val response = UserApprovalResponse(
                id = userStatus.id,
                username = userStatus.username,
                email = userStatus.email,
                fullName = userStatus.fullName,
                approvalStatus = userStatus.approvalStatus,
                approvedBy = userStatus.approvedBy,
                approvedDate = userStatus.approvedDate,
                rejectionReason = userStatus.rejectionReason,
                createdAt = userStatus.createdAt
            )

            return ResponseEntity.ok(response)
        } catch (e: Exception) {
            return ResponseEntity.notFound().build()
        }
    }
} 