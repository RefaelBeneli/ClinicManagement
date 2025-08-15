package com.clinic.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class ExpenseRequest(
    @field:NotBlank(message = "Expense name is required")
    val name: String,
    
    val description: String? = null,
    
    @field:NotNull(message = "Amount is required")
    @field:Positive(message = "Amount must be positive")
    val amount: BigDecimal,
    
    val currency: String = "ILS",
    
    @field:NotNull(message = "Category ID is required")
    val categoryId: Long,
    
    val notes: String? = null,
    
    @field:NotNull(message = "Expense date is required")
    val expenseDate: LocalDate,
    
    @JsonProperty("isRecurring")
    val isRecurring: Boolean = false,
    
    val recurrenceFrequency: String? = null,
    
    val recurrenceCount: Int? = null,
    
    val nextDueDate: LocalDate? = null,
    
    val isPaid: Boolean = false,
    
    val paymentTypeId: Long? = null,
    
    val receiptUrl: String? = null
)

data class ExpenseResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val amount: BigDecimal,
    val currency: String,
    val category: ExpenseCategoryResponse,
    val notes: String?,
    val expenseDate: LocalDate,
    val isRecurring: Boolean,
    val recurrenceFrequency: String?,
    val recurrenceCount: Int?,
    val nextDueDate: LocalDate?,
    @JsonProperty("isPaid")
    val isPaid: Boolean,
    val paymentType: PaymentTypeResponse?,
    val receiptUrl: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    @JsonProperty("isActive")
    val isActive: Boolean
)

data class UpdateExpenseRequest(
    val name: String? = null,
    val description: String? = null,
    val amount: BigDecimal? = null,
    val currency: String? = null,
    val categoryId: Long? = null,
    val notes: String? = null,
    val expenseDate: LocalDate? = null,
    @JsonProperty("isRecurring")
    val isRecurring: Boolean? = null,
    val recurrenceFrequency: String? = null,
    val recurrenceCount: Int? = null,
    val nextDueDate: LocalDate? = null,
    @JsonProperty("isPaid")
    val isPaid: Boolean? = null,
    val paymentTypeId: Long? = null,
    val receiptUrl: String? = null,
    @JsonProperty("isActive")
    val isActive: Boolean? = null
)

data class ExpenseSummaryResponse(
    val totalExpenses: BigDecimal,
    val paidExpenses: BigDecimal,
    val unpaidExpenses: BigDecimal,
    val recurringExpenses: BigDecimal,
    val monthlyAverage: BigDecimal,
    val categoryBreakdown: Map<String, BigDecimal>
) 