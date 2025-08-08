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
     * Get count of pending users for dashboard notifications
     */
    @GetMapping("/pending/count")
    fun getPendingUsersCount(): ResponseEntity<Map<String, Long>> {
        val count = userApprovalService.getPendingUsersCount()
        return ResponseEntity.ok(mapOf("count" to count))
    }



    /**
     * Get approval history for all users
     */
    @GetMapping("/approval-history")
    fun getApprovalHistory(): ResponseEntity<List<ApprovalHistoryResponse>> {
        val history = userApprovalService.getApprovalHistory()
        return ResponseEntity.ok(history)
    }


} 