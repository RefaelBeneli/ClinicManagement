package com.clinic.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import com.clinic.entity.PaymentType

@Entity
@Table(name = "expenses")
data class Expense(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Column(nullable = false)
    val name: String,
    
    @Column(columnDefinition = "TEXT")
    val description: String? = null,
    
    @Column(nullable = false, precision = 10, scale = 2)
    val amount: BigDecimal,
    
    @Column(nullable = false, length = 3)
    val currency: String = "ILS",
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    val category: ExpenseCategory,
    
    @Column(columnDefinition = "TEXT")
    val notes: String? = null,
    
    @Column(name = "expense_date", nullable = false)
    val expenseDate: LocalDate,
    
    @Column(name = "is_recurring", nullable = false)
    val isRecurring: Boolean = false,
    
    @Column(name = "recurrence_frequency", length = 50)
    val recurrenceFrequency: String? = null,
    
    @Column(name = "recurrence_count")
    val recurrenceCount: Int? = null,
    
    @Column(name = "next_due_date")
    val nextDueDate: LocalDate? = null,
    
    @Column(name = "receipt_url", length = 500)
    val receiptUrl: String? = null,
    
    // Payment-related fields
    @Column(name = "is_paid", nullable = false)
    val isPaid: Boolean = false,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_type_id")
    val paymentType: PaymentType? = null,
    
    @Column(name = "payment_date")
    val paymentDate: LocalDateTime? = null,
    
    @Column(name = "reference_number", length = 255)
    val referenceNumber: String? = null,
    
    @Column(name = "transaction_id", length = 255)
    val transactionId: String? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true
) 