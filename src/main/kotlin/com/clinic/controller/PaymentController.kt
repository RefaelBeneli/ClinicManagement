package com.clinic.controller

import com.clinic.dto.*
import com.clinic.entity.PaymentStatus
import com.clinic.entity.SessionType
import com.clinic.service.PaymentService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.math.BigDecimal

@RestController
@RequestMapping("/api/payments")
class PaymentController(
    private val paymentService: PaymentService
) {
    
    /**
     * Create payment for a meeting
     */
    @PostMapping("/meetings/{meetingId}")
    fun createPaymentForMeeting(
        @PathVariable meetingId: Long,
        @RequestBody request: CreatePaymentRequest,
        authentication: Authentication
    ): ResponseEntity<PaymentResponse> {
        val payment = paymentService.createPaymentForMeeting(
            meetingId = meetingId,
            paymentTypeId = request.paymentTypeId,
            amount = request.amount,
            referenceNumber = request.referenceNumber,
            notes = request.notes,
            transactionId = request.transactionId,
            receiptUrl = request.receiptUrl
        )
        
        return ResponseEntity.ok(payment.toPaymentResponse())
    }
    
    /**
     * Create payment for a personal meeting
     */
    @PostMapping("/personal-meetings/{personalMeetingId}")
    fun createPaymentForPersonalMeeting(
        @PathVariable personalMeetingId: Long,
        @RequestBody request: CreatePaymentRequest,
        authentication: Authentication
    ): ResponseEntity<PaymentResponse> {
        val payment = paymentService.createPaymentForPersonalMeeting(
            personalMeetingId = personalMeetingId,
            paymentTypeId = request.paymentTypeId,
            amount = request.amount,
            referenceNumber = request.referenceNumber,
            notes = request.notes,
            transactionId = request.transactionId,
            receiptUrl = request.receiptUrl
        )
        
        return ResponseEntity.ok(payment.toPaymentResponse())
    }
    
    /**
     * Get payments for a specific session
     */
    @GetMapping("/sessions/{sessionId}")
    fun getPaymentsForSession(
        @PathVariable sessionId: Long,
        @RequestParam sessionType: SessionType
    ): ResponseEntity<List<PaymentResponse>> {
        val payments = paymentService.getPaymentsForSession(sessionId, sessionType)
        return ResponseEntity.ok(payments.map { it.toPaymentResponse() })
    }
    
    /**
     * Get payments by date range
     */
    @GetMapping("/date-range")
    fun getPaymentsByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: LocalDateTime,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: LocalDateTime
    ): ResponseEntity<List<PaymentResponse>> {
        val payments = paymentService.getPaymentsByDateRange(startDate, endDate)
        return ResponseEntity.ok(payments.map { it.toPaymentResponse() })
    }
    
    /**
     * Get payment summary for a user in a date range
     */
    @GetMapping("/summary")
    fun getPaymentSummary(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: LocalDateTime,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: LocalDateTime,
        authentication: Authentication
    ): ResponseEntity<PaymentSummaryResponse> {
        // Extract user ID from authentication (you'll need to implement this based on your auth setup)
        val userId = 1L // Placeholder - implement based on your auth context
        
        val totalPayments = paymentService.getTotalPaymentsByUserAndDateRange(userId, startDate, endDate)
        
        // For now, return a simple summary. You can enhance this later
        val summary = PaymentSummaryResponse(
            totalPayments = totalPayments,
            totalRefunds = BigDecimal.ZERO,
            netAmount = totalPayments,
            paymentCount = 0, // You can implement this later
            refundCount = 0
        )
        
        return ResponseEntity.ok(summary)
    }
    
    /**
     * Update payment status
     */
    @PutMapping("/{paymentId}/status")
    fun updatePaymentStatus(
        @PathVariable paymentId: Long,
        @RequestBody request: UpdatePaymentStatusRequest
    ): ResponseEntity<PaymentResponse> {
        val payment = paymentService.updatePaymentStatus(paymentId, request.status)
        return ResponseEntity.ok(payment.toPaymentResponse())
    }
    
    /**
     * Refund a payment
     */
    @PostMapping("/{paymentId}/refund")
    fun refundPayment(
        @PathVariable paymentId: Long,
        @RequestBody request: RefundPaymentRequest
    ): ResponseEntity<PaymentResponse> {
        val refundPayment = paymentService.refundPayment(
            paymentId = paymentId,
            refundAmount = request.refundAmount,
            notes = request.notes
        )
        return ResponseEntity.ok(refundPayment.toPaymentResponse())
    }
}

// Extension function to convert Payment entity to DTO
fun com.clinic.entity.Payment.toPaymentResponse(): PaymentResponse {
    return PaymentResponse(
        id = this.id,
        sessionId = this.sessionId,
        sessionType = this.sessionType,
        paymentTypeName = this.paymentType.name,
        amount = this.amount,
        currency = this.currency,
        paymentDate = this.paymentDate,
        referenceNumber = this.referenceNumber,
        notes = this.notes,
        transactionId = this.transactionId,
        receiptUrl = this.receiptUrl,
        status = this.status,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}
