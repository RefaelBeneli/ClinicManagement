package com.clinic.dto

import com.clinic.entity.PaymentStatus
import com.clinic.entity.SessionType
import java.math.BigDecimal
import java.time.LocalDateTime

data class CreatePaymentRequest(
    val sessionId: Long,
    val sessionType: SessionType,
    val paymentTypeId: Long,
    val amount: BigDecimal? = null,
    val referenceNumber: String? = null,
    val notes: String? = null,
    val transactionId: String? = null,
    val receiptUrl: String? = null
)

data class PaymentResponse(
    val id: Long,
    val sessionId: Long,
    val sessionType: SessionType,
    val paymentTypeName: String,
    val amount: BigDecimal,
    val currency: String,
    val paymentDate: LocalDateTime,
    val referenceNumber: String?,
    val notes: String?,
    val transactionId: String?,
    val receiptUrl: String?,
    val status: PaymentStatus,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class UpdatePaymentStatusRequest(
    val status: PaymentStatus
)

data class RefundPaymentRequest(
    val refundAmount: BigDecimal,
    val notes: String? = null
)



data class PaymentSummaryResponse(
    val totalPayments: BigDecimal,
    val totalRefunds: BigDecimal,
    val netAmount: BigDecimal,
    val paymentCount: Int,
    val refundCount: Int
)
