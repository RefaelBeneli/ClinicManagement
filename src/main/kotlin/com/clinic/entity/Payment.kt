package com.clinic.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "payments")
data class Payment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Column(name = "session_id", nullable = false)
    val sessionId: Long,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    val sessionType: SessionType,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_type_id", nullable = false)
    val paymentType: PaymentType,
    
    @Column(nullable = false, precision = 10, scale = 2)
    val amount: BigDecimal,
    
    @Column(nullable = false, length = 3)
    val currency: String = "ILS",
    
    @Column(name = "payment_date", nullable = false)
    val paymentDate: LocalDateTime,
    
    @Column(name = "reference_number", nullable = true)
    val referenceNumber: String? = null,
    
    @Column(nullable = true, columnDefinition = "TEXT")
    val notes: String? = null,
    
    @Column(name = "transaction_id", nullable = true)
    val transactionId: String? = null, // For external payment systems
    
    @Column(name = "receipt_url", nullable = true)
    val receiptUrl: String? = null, // URL to receipt/document
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: PaymentStatus = PaymentStatus.COMPLETED,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true
)

enum class SessionType {
    MEETING,
    PERSONAL_MEETING,
    EXPENSE
}

enum class PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REFUNDED,
    CANCELLED,
    INACTIVE
}
