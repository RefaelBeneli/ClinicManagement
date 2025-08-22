package com.clinic.repository

import com.clinic.entity.Payment
import com.clinic.entity.SessionType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface PaymentRepository : JpaRepository<Payment, Long> {
    
    fun findByUserId(userId: Long): List<Payment>
    
    fun findBySessionIdAndSessionType(sessionId: Long, sessionType: SessionType): List<Payment>
    
    fun findByPaymentDateBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<Payment>
    
    fun findByUserIdAndPaymentDateBetween(userId: Long, startDate: LocalDateTime, endDate: LocalDateTime): List<Payment>
    
    fun findByPaymentTypeId(paymentTypeId: Long): List<Payment>
    
    @Query("SELECT p FROM Payment p WHERE p.user.id = :userId AND p.sessionType = :sessionType")
    fun findByUserIdAndSessionType(@Param("userId") userId: Long, @Param("sessionType") sessionType: SessionType): List<Payment>
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.user.id = :userId AND p.status = 'COMPLETED' AND p.paymentDate BETWEEN :startDate AND :endDate")
    fun getTotalPaymentsByUserAndDateRange(@Param("userId") userId: Long, @Param("startDate") startDate: LocalDateTime, @Param("endDate") endDate: LocalDateTime): java.math.BigDecimal?
    
    // Find only active payments
    fun findByIsActiveTrue(): List<Payment>
    
    fun findByUserIdAndIsActiveTrue(userId: Long): List<Payment>
    
    fun findBySessionIdAndSessionTypeAndIsActiveTrue(sessionId: Long, sessionType: SessionType): List<Payment>
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.user.id = :userId AND p.status = 'COMPLETED' AND p.isActive = true AND p.paymentDate BETWEEN :startDate AND :endDate")
    fun getTotalActivePaymentsByUserAndDateRange(@Param("userId") userId: Long, @Param("startDate") startDate: LocalDateTime, @Param("endDate") endDate: LocalDateTime): java.math.BigDecimal?
}
