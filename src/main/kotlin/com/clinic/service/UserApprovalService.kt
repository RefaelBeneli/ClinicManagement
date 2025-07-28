package com.clinic.service

import com.clinic.dto.*
import com.clinic.entity.User
import com.clinic.entity.UserApprovalStatus
import com.clinic.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class UserApprovalService {

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var authService: AuthService

    /**
     * Get all users pending approval
     */
    fun getPendingUsers(): List<PendingUserResponse> {
        val pendingUsers = userRepository.findByApprovalStatus(UserApprovalStatus.PENDING)
        return pendingUsers.map { user ->
            PendingUserResponse(
                id = user.id,
                username = user.username,
                email = user.email,
                fullName = user.fullName,
                createdAt = user.createdAt,
                approvalStatus = user.approvalStatus
            )
        }
    }

    /**
     * Approve a user's registration
     */
    @Transactional
    fun approveUser(userId: Long, reason: String?): UserApprovalResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        if (user.approvalStatus != UserApprovalStatus.PENDING) {
            throw IllegalStateException("User is not in pending status")
        }

        val currentAdmin = authService.getCurrentUser()
        
        // Create new user object with approval data
        val approvedUser = User(
            id = user.id,
            username = user.username,
            email = user.email,
            fullName = user.fullName,
            password = user.password,
            role = user.role,
            enabled = true,
            approvalStatus = UserApprovalStatus.APPROVED,
            approvedBy = currentAdmin,
            approvedDate = LocalDateTime.now(),
            rejectionReason = null,
            createdAt = user.createdAt
        )

        val savedUser = userRepository.save(approvedUser)

        // TODO: Send approval email notification to user
        // sendApprovalEmail(savedUser)

        return UserApprovalResponse(
            id = savedUser.id,
            username = savedUser.username,
            email = savedUser.email,
            fullName = savedUser.fullName,
            approvalStatus = savedUser.approvalStatus,
            approvedBy = savedUser.approvedBy?.fullName,
            approvedDate = savedUser.approvedDate,
            rejectionReason = savedUser.rejectionReason,
            createdAt = savedUser.createdAt
        )
    }

    /**
     * Reject a user's registration
     */
    @Transactional
    fun rejectUser(userId: Long, reason: String): UserApprovalResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        if (user.approvalStatus != UserApprovalStatus.PENDING) {
            throw IllegalStateException("User is not in pending status")
        }

        val currentAdmin = authService.getCurrentUser()

        // Create new user object with rejection data
        val rejectedUser = User(
            id = user.id,
            username = user.username,
            email = user.email,
            fullName = user.fullName,
            password = user.password,
            role = user.role,
            enabled = false,
            approvalStatus = UserApprovalStatus.REJECTED,
            approvedBy = currentAdmin,
            approvedDate = LocalDateTime.now(),
            rejectionReason = reason,
            createdAt = user.createdAt
        )

        val savedUser = userRepository.save(rejectedUser)

        // TODO: Send rejection email notification to user
        // sendRejectionEmail(savedUser, reason)

        return UserApprovalResponse(
            id = savedUser.id,
            username = savedUser.username,
            email = savedUser.email,
            fullName = savedUser.fullName,
            approvalStatus = savedUser.approvalStatus,
            approvedBy = savedUser.approvedBy?.fullName,
            approvedDate = savedUser.approvedDate,
            rejectionReason = savedUser.rejectionReason,
            createdAt = savedUser.createdAt
        )
    }

    /**
     * Get approval history for all users
     */
    fun getApprovalHistory(): List<ApprovalHistoryResponse> {
        val allUsers = userRepository.findByApprovalStatusIn(
            listOf(UserApprovalStatus.APPROVED, UserApprovalStatus.REJECTED)
        )
        
        return allUsers.map { user ->
            ApprovalHistoryResponse(
                id = user.id,
                username = user.username,
                email = user.email,
                fullName = user.fullName,
                approvalStatus = user.approvalStatus,
                approvedBy = user.approvedBy?.fullName,
                approvedDate = user.approvedDate,
                rejectionReason = user.rejectionReason,
                createdAt = user.createdAt
            )
        }.sortedByDescending { it.approvedDate }
    }

    /**
     * Get count of pending users for dashboard notifications
     */
    fun getPendingUsersCount(): Long {
        return userRepository.countByApprovalStatus(UserApprovalStatus.PENDING)
    }

    /**
     * Check if a user is approved and enabled
     */
    fun isUserApprovedAndEnabled(userId: Long): Boolean {
        val user = userRepository.findById(userId).orElse(null)
        return user?.let { 
            it.approvalStatus == UserApprovalStatus.APPROVED && it.isEnabled 
        } ?: false
    }

    // TODO: Email notification methods to be implemented
    /*
    private fun sendApprovalEmail(user: User) {
        // Send welcome email to approved user
    }

    private fun sendRejectionEmail(user: User, reason: String) {
        // Send rejection notification to user
    }
    */
} 