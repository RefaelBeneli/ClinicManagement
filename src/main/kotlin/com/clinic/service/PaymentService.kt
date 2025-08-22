package com.clinic.service

import com.clinic.entity.*
import com.clinic.repository.PaymentRepository
import com.clinic.repository.MeetingRepository
import com.clinic.repository.PersonalMeetingRepository
import com.clinic.repository.ExpenseRepository
import com.clinic.repository.PaymentTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
class PaymentService(
    private val paymentRepository: PaymentRepository,
    private val meetingRepository: MeetingRepository,
    private val personalMeetingRepository: PersonalMeetingRepository,
    private val expenseRepository: ExpenseRepository,
    private val paymentTypeRepository: PaymentTypeRepository
) {
    
    /**
     * Create a payment record when a meeting is marked as paid
     */
    @Transactional
    fun createPaymentForMeeting(
        meetingId: Long,
        paymentTypeId: Long,
        amount: BigDecimal? = null,
        referenceNumber: String? = null,
        notes: String? = null,
        transactionId: String? = null,
        receiptUrl: String? = null
    ): Payment {
        val meeting = meetingRepository.findById(meetingId)
            .orElseThrow { IllegalArgumentException("Meeting not found with id: $meetingId") }
        
        val paymentType = paymentTypeRepository.findById(paymentTypeId)
            .orElseThrow { IllegalArgumentException("Payment type not found with id: $paymentTypeId") }
        
        val paymentAmount = amount ?: meeting.price
        
        val payment = Payment(
            user = meeting.user,
            sessionId = meeting.id,
            sessionType = SessionType.MEETING,
            paymentType = paymentType,
            amount = paymentAmount,
            paymentDate = LocalDateTime.now(),
            referenceNumber = referenceNumber,
            notes = notes,
            transactionId = transactionId,
            receiptUrl = receiptUrl
        )
        
        // Update meeting to mark as paid
        val updatedMeeting = meeting.copy(isPaid = true)
        meetingRepository.save(updatedMeeting)
        
        return paymentRepository.save(payment)
    }
    
    /**
     * Create a payment record when a personal meeting is marked as paid
     */
    @Transactional
    fun createPaymentForPersonalMeeting(
        personalMeetingId: Long,
        paymentTypeId: Long,
        amount: BigDecimal? = null,
        referenceNumber: String? = null,
        notes: String? = null,
        transactionId: String? = null,
        receiptUrl: String? = null
    ): Payment {
        val personalMeeting = personalMeetingRepository.findById(personalMeetingId)
            .orElseThrow { IllegalArgumentException("Personal meeting not found with id: $personalMeetingId") }
        
        val paymentType = paymentTypeRepository.findById(paymentTypeId)
            .orElseThrow { IllegalArgumentException("Payment type not found with id: $paymentTypeId") }
        
        val paymentAmount = amount ?: personalMeeting.price
        
        val payment = Payment(
            user = personalMeeting.user,
            sessionId = personalMeeting.id,
            sessionType = SessionType.PERSONAL_MEETING,
            paymentType = paymentType,
            amount = paymentAmount,
            paymentDate = LocalDateTime.now(),
            referenceNumber = referenceNumber,
            notes = notes,
            transactionId = transactionId,
            receiptUrl = receiptUrl
        )
        
        // Update personal meeting to mark as paid
        val updatedPersonalMeeting = personalMeeting.copy(isPaid = true)
        personalMeetingRepository.save(updatedPersonalMeeting)
        
        return paymentRepository.save(payment)
    }
    
    /**
     * Create a payment record when an expense is marked as paid
     */
    @Transactional
    fun createPaymentForExpense(
        expenseId: Long,
        paymentTypeId: Long,
        amount: BigDecimal? = null,
        referenceNumber: String? = null,
        notes: String? = null,
        transactionId: String? = null,
        receiptUrl: String? = null
    ): Payment {
        val expense = expenseRepository.findById(expenseId)
            .orElseThrow { IllegalArgumentException("Expense not found with id: $expenseId") }
        
        val paymentType = paymentTypeRepository.findById(paymentTypeId)
            .orElseThrow { IllegalArgumentException("Payment type not found with id: $paymentTypeId") }
        
        val paymentAmount = amount ?: expense.amount
        
        val payment = Payment(
            user = expense.user,
            sessionId = expense.id,
            sessionType = SessionType.EXPENSE,
            paymentType = paymentType,
            amount = paymentAmount,
            paymentDate = LocalDateTime.now(),
            referenceNumber = referenceNumber,
            notes = notes,
            transactionId = transactionId,
            receiptUrl = receiptUrl
        )
        
        return paymentRepository.save(payment)
    }
    
    /**
     * Get all active payments for a specific session
     */
    fun getPaymentsForSession(sessionId: Long, sessionType: SessionType): List<Payment> {
        return paymentRepository.findBySessionIdAndSessionTypeAndIsActiveTrue(sessionId, sessionType)
    }
    
    /**
     * Get all active payments for a user
     */
    fun getPaymentsByUser(userId: Long): List<Payment> {
        return paymentRepository.findByUserIdAndIsActiveTrue(userId)
    }
    
    /**
     * Get active payments by date range
     */
    fun getPaymentsByDateRange(startDate: LocalDateTime, endDate: LocalDateTime): List<Payment> {
        return paymentRepository.findByPaymentDateBetween(startDate, endDate).filter { it.isActive }
    }
    
    /**
     * Get total active payments for a user in a date range
     */
    fun getTotalPaymentsByUserAndDateRange(userId: Long, startDate: LocalDateTime, endDate: LocalDateTime): BigDecimal {
        return paymentRepository.getTotalActivePaymentsByUserAndDateRange(userId, startDate, endDate) ?: BigDecimal.ZERO
    }
    
    /**
     * Get all payments for a specific session (including inactive for audit purposes)
     */
    fun getAllPaymentsForSession(sessionId: Long, sessionType: SessionType): List<Payment> {
        return paymentRepository.findBySessionIdAndSessionType(sessionId, sessionType)
    }
    
    /**
     * Get all payments for a user (including inactive for audit purposes)
     */
    fun getAllPaymentsByUser(userId: Long): List<Payment> {
        return paymentRepository.findByUserId(userId)
    }
    
    /**
     * Update payment status
     */
    @Transactional
    fun updatePaymentStatus(paymentId: Long, status: PaymentStatus): Payment {
        val payment = paymentRepository.findById(paymentId)
            .orElseThrow { IllegalArgumentException("Payment not found with id: $paymentId") }
        
        val updatedPayment = payment.copy(
            status = status,
            updatedAt = LocalDateTime.now()
        )
        
        return paymentRepository.save(updatedPayment)
    }
    
    /**
     * Refund a payment
     */
    @Transactional
    fun refundPayment(paymentId: Long, refundAmount: BigDecimal, notes: String? = null): Payment {
        val originalPayment = paymentRepository.findById(paymentId)
            .orElseThrow { IllegalArgumentException("Payment not found with id: $paymentId") }
        
        // Create refund payment record
        val refundPayment = Payment(
            user = originalPayment.user,
            sessionId = originalPayment.sessionId,
            sessionType = originalPayment.sessionType,
            paymentType = originalPayment.paymentType,
            amount = refundAmount.negate(), // Negative amount for refund
            paymentDate = LocalDateTime.now(),
            notes = notes ?: "Refund for payment #${originalPayment.id}",
            status = PaymentStatus.REFUNDED
        )
        
        // Update original payment status
        val updatedOriginalPayment = originalPayment.copy(
            status = PaymentStatus.REFUNDED,
            updatedAt = LocalDateTime.now()
        )
        
        paymentRepository.save(updatedOriginalPayment)
        return paymentRepository.save(refundPayment)
    }
    
    /**
     * Soft delete payment when marking session as unpaid
     * This preserves payment history for audit purposes
     */
    @Transactional
    fun deactivatePaymentForSession(sessionId: Long, sessionType: SessionType): Boolean {
        val payments = paymentRepository.findBySessionIdAndSessionType(sessionId, sessionType)
        
        if (payments.isEmpty()) {
            return false // No payments to deactivate
        }
        
        // Soft delete all payments for this session
        payments.forEach { payment ->
            val deactivatedPayment = payment.copy(
                status = PaymentStatus.INACTIVE,
                isActive = false,
                updatedAt = LocalDateTime.now()
            )
            paymentRepository.save(deactivatedPayment)
        }
        
        return true
    }
}
