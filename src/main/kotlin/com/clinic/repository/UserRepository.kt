package com.clinic.repository

import com.clinic.entity.User
import com.clinic.entity.UserApprovalStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByUsername(username: String): Optional<User>
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean
    
    // User approval system methods
    fun findByApprovalStatus(status: UserApprovalStatus): List<User>
    fun findByApprovalStatus(status: UserApprovalStatus, pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<User>
    fun findByApprovalStatusIn(statuses: List<UserApprovalStatus>): List<User>
    fun countByApprovalStatus(status: UserApprovalStatus): Long
    
    fun findTop5ByOrderByCreatedAtDesc(): List<User>
} 