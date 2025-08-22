package com.clinic.service

import com.clinic.dto.*
import com.clinic.entity.Expense
import com.clinic.entity.ExpenseCategory
import com.clinic.entity.User
import com.clinic.repository.ExpenseRepository
import com.clinic.repository.ExpenseCategoryRepository
import com.clinic.repository.PaymentRepository
import com.clinic.repository.PaymentTypeRepository
import com.clinic.entity.Payment
import com.clinic.entity.PaymentType
import com.clinic.entity.SessionType
import com.clinic.dto.PaymentTypeResponse
import com.clinic.service.PaymentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import com.clinic.entity.PaymentStatus

@Service
class ExpenseService {

    @Autowired
    private lateinit var expenseRepository: ExpenseRepository

    @Autowired
    private lateinit var expenseCategoryRepository: ExpenseCategoryRepository

    @Autowired
    private lateinit var paymentRepository: PaymentRepository

    @Autowired
    private lateinit var paymentTypeRepository: PaymentTypeRepository

    @Autowired
    private lateinit var paymentService: PaymentService

    @Autowired
    private lateinit var authService: AuthService

    fun createExpense(expenseRequest: ExpenseRequest): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        
        println("🔍 Received expense request: isRecurring=${expenseRequest.isRecurring}, frequency=${expenseRequest.recurrenceFrequency}, count=${expenseRequest.recurrenceCount}")
        
        val category = expenseCategoryRepository.findById(expenseRequest.categoryId)
            .orElseThrow { RuntimeException("Expense category not found with id: ${expenseRequest.categoryId}") }
        
        if (expenseRequest.isRecurring && expenseRequest.recurrenceFrequency != null && expenseRequest.recurrenceCount != null) {
            println("✅ Creating recurring expenses with count=${expenseRequest.recurrenceCount}")
            return createRecurringExpenses(expenseRequest, currentUser, category)
        } else {
            println("❌ Not creating recurring expenses. Conditions: isRecurring=${expenseRequest.isRecurring}, frequency=${expenseRequest.recurrenceFrequency}, count=${expenseRequest.recurrenceCount}")
            val expense = Expense(
                user = currentUser,
                name = expenseRequest.name,
                description = expenseRequest.description,
                amount = expenseRequest.amount,
                currency = expenseRequest.currency,
                category = category,
                notes = expenseRequest.notes,
                expenseDate = expenseRequest.expenseDate,
                isRecurring = expenseRequest.isRecurring,
                recurrenceFrequency = expenseRequest.recurrenceFrequency,
                recurrenceCount = expenseRequest.recurrenceCount,
                nextDueDate = expenseRequest.nextDueDate,
                receiptUrl = expenseRequest.receiptUrl
            )
            
            val savedExpense = expenseRepository.save(expense)
            return mapToResponse(savedExpense)
        }
    }

    private fun createRecurringExpenses(
        expenseRequest: ExpenseRequest,
        currentUser: User,
        category: ExpenseCategory
    ): ExpenseResponse {
        if (expenseRequest.recurrenceFrequency == null) {
            throw RuntimeException("Recurrence frequency is required for recurring expenses")
        }

        val recurrenceCount = expenseRequest.recurrenceCount ?: 1
        val totalExpenses = recurrenceCount + 1 // Original expense + recurring ones
        println("🔄 Creating recurring expenses: total=$totalExpenses, frequency=${expenseRequest.recurrenceFrequency}")
        
        val expenses = mutableListOf<Expense>()
        var currentDate = expenseRequest.expenseDate

        // Create the first (parent) expense
        val parentExpense = Expense(
            user = currentUser,
            name = expenseRequest.name,
            description = expenseRequest.description,
            amount = expenseRequest.amount,
            currency = expenseRequest.currency,
            category = category,
            notes = expenseRequest.notes,
            expenseDate = currentDate,
            isRecurring = true,
            recurrenceFrequency = expenseRequest.recurrenceFrequency,
            recurrenceCount = recurrenceCount,
            nextDueDate = if (totalExpenses > 1) calculateNextExpenseDate(currentDate, expenseRequest.recurrenceFrequency) else null,
            receiptUrl = expenseRequest.receiptUrl
        )
        val savedParentExpense = expenseRepository.save(parentExpense)
        expenses.add(savedParentExpense)
        println("✅ Created parent expense (occurrence 1)")

        // Create subsequent expenses
        for (occurrence in 2..totalExpenses) {
            currentDate = calculateNextExpenseDate(currentDate, expenseRequest.recurrenceFrequency)
            
            val expense = Expense(
                user = currentUser,
                name = expenseRequest.name,
                description = expenseRequest.description,
                amount = expenseRequest.amount,
                currency = expenseRequest.currency,
                category = category,
                notes = expenseRequest.notes,
                expenseDate = currentDate,
                isRecurring = true,
                recurrenceFrequency = expenseRequest.recurrenceFrequency,
                recurrenceCount = recurrenceCount,
                nextDueDate = if (occurrence < totalExpenses) calculateNextExpenseDate(currentDate, expenseRequest.recurrenceFrequency) else null,
                receiptUrl = expenseRequest.receiptUrl
            )
            expenses.add(expenseRepository.save(expense))
            println("✅ Created occurrence $occurrence")
        }

        println("🎉 Total expenses created: ${expenses.size}")
        return mapToResponse(savedParentExpense)
    }

    private fun calculateNextExpenseDate(currentDate: LocalDate, frequency: String): LocalDate {
        return when (frequency.uppercase()) {
            "DAILY" -> currentDate.plusDays(1)
            "WEEKLY" -> currentDate.plusWeeks(1)
            "MONTHLY" -> currentDate.plusMonths(1)
            "QUARTERLY" -> currentDate.plusMonths(3)
            "YEARLY" -> currentDate.plusYears(1)
            else -> throw RuntimeException("Unsupported recurrence frequency: $frequency")
        }
    }

    fun getAllExpenses(): List<ExpenseResponse> {
        val currentUser = authService.getCurrentUser()
        return expenseRepository.findByUserWithPaymentType(currentUser)
            .map { mapToResponse(it) }
    }

    fun getExpenseById(id: Long): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        val expense = expenseRepository.findById(id)
            .filter { it.user.id == currentUser.id }
            .orElseThrow { RuntimeException("Expense not found") }
        
        return mapToResponse(expense)
    }

    fun updateExpense(id: Long, updateRequest: UpdateExpenseRequest): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        val expense = expenseRepository.findById(id)
            .filter { it.user.id == currentUser.id }
            .orElseThrow { RuntimeException("Expense not found") }

        val category = updateRequest.categoryId?.let { categoryId ->
            expenseCategoryRepository.findById(categoryId)
                .orElseThrow { RuntimeException("Expense category not found with id: $categoryId") }
        } ?: expense.category



        val updatedExpense = expense.copy(
            name = updateRequest.name ?: expense.name,
            description = updateRequest.description,
            amount = updateRequest.amount ?: expense.amount,
            currency = updateRequest.currency ?: expense.currency,
            category = category,
            notes = updateRequest.notes,
            expenseDate = updateRequest.expenseDate ?: expense.expenseDate,
            isRecurring = updateRequest.isRecurring ?: expense.isRecurring,
            recurrenceFrequency = updateRequest.recurrenceFrequency,
            recurrenceCount = updateRequest.recurrenceCount ?: expense.recurrenceCount,
            nextDueDate = updateRequest.nextDueDate,
            receiptUrl = updateRequest.receiptUrl,
            isActive = updateRequest.isActive ?: expense.isActive,
            updatedAt = LocalDateTime.now()
        )

        val savedExpense = expenseRepository.save(updatedExpense)
        return mapToResponse(savedExpense)
    }

    fun deleteExpense(id: Long) {
        val currentUser = authService.getCurrentUser()
        val expense = expenseRepository.findById(id)
            .filter { it.user.id == currentUser.id }
            .orElseThrow { RuntimeException("Expense not found") }
        
        // Soft delete instead of hard delete
        val deactivatedExpense = expense.copy(isActive = false)
        expenseRepository.save(deactivatedExpense)
    }

    fun activateExpense(id: Long): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        val expense = expenseRepository.findById(id)
            .filter { it.user.id == currentUser.id }
            .orElseThrow { RuntimeException("Expense not found") }
        
        val activatedExpense = expense.copy(isActive = true)
        val savedExpense = expenseRepository.save(activatedExpense)
        return mapToResponse(savedExpense)
    }

    fun deactivateExpense(id: Long): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        val expense = expenseRepository.findById(id)
            .filter { it.user.id == currentUser.id }
            .orElseThrow { RuntimeException("Expense not found") }
        
        val deactivatedExpense = expense.copy(isActive = false)
        val savedExpense = expenseRepository.save(deactivatedExpense)
        return mapToResponse(savedExpense)
    }

    fun getExpensesByCategory(categoryId: Long): List<ExpenseResponse> {
        val currentUser = authService.getCurrentUser()
        val category = expenseCategoryRepository.findById(categoryId)
            .orElseThrow { RuntimeException("Expense category not found with id: $categoryId") }
        return expenseRepository.findByUserAndCategory(currentUser, category)
            .map { mapToResponse(it) }
    }

    fun getExpensesByDateRange(startDate: LocalDate, endDate: LocalDate): List<ExpenseResponse> {
        val currentUser = authService.getCurrentUser()
        return expenseRepository.findByUserAndExpenseDateBetween(currentUser, startDate, endDate)
            .map { mapToResponse(it) }
    }

    fun getRecurringExpenses(): List<ExpenseResponse> {
        val currentUser = authService.getCurrentUser()
        return expenseRepository.findByUserAndIsRecurringTrue(currentUser)
            .map { mapToResponse(it) }
    }

    fun getUpcomingExpenses(): List<ExpenseResponse> {
        val currentUser = authService.getCurrentUser()
        val today = LocalDate.now()
        return expenseRepository.findByUserAndNextDueDateBefore(currentUser, today)
            .map { mapToResponse(it) }
    }

    fun getExpenseSummary(): ExpenseSummaryResponse {
        val currentUser = authService.getCurrentUser()
        
        val totalRecurring = expenseRepository.getTotalRecurringAmount(currentUser) ?: BigDecimal.ZERO
        
        // Calculate monthly average for the last 12 months
        val twelveMonthsAgo = LocalDate.now().minusMonths(12)
        val monthlyAverage = expenseRepository.getAverageAmountForPeriod(currentUser, twelveMonthsAgo, LocalDate.now()) ?: BigDecimal.ZERO
        
        // Get category breakdown
        val categoryBreakdown = expenseRepository.getCategoryBreakdown(currentUser)
            .associate { (category, amount) -> 
                category.name to (amount as BigDecimal)
            }
        
        // Calculate paid/unpaid expenses
        val totalExpenses = expenseRepository.findByUser(currentUser).sumOf { it.amount }
        val paidExpenses = expenseRepository.findByUserAndIsPaidTrue(currentUser).sumOf { it.amount }
        val unpaidExpenses = totalExpenses - paidExpenses
        
        return ExpenseSummaryResponse(
            totalExpenses = totalExpenses,
            paidExpenses = paidExpenses,
            unpaidExpenses = unpaidExpenses,
            recurringExpenses = totalRecurring,
            monthlyAverage = monthlyAverage,
            categoryBreakdown = categoryBreakdown
        )
    }

    // Payment-related methods - following the same pattern as PersonalMeetingService
    fun updatePaymentStatus(
        expenseId: Long, 
        isPaid: Boolean, 
        paymentTypeId: Long? = null, 
        amount: java.math.BigDecimal? = null, 
        referenceNumber: String? = null, 
        notes: String? = null, 
        transactionId: String? = null, 
        receiptUrl: String? = null
    ): ExpenseResponse {
        println("🔧 updatePaymentStatus called with: isPaid=$isPaid, paymentTypeId=$paymentTypeId")
        
        val currentUser = authService.getCurrentUser()
        val expense = expenseRepository.findById(expenseId)
            .filter { it.user.id == currentUser.id }
            .orElseThrow { RuntimeException("Expense not found") }
        
        // If marking as paid, require payment type
        if (isPaid && paymentTypeId == null) {
            println("🔧 ERROR: Payment type required for paid expense")
            throw RuntimeException("Payment type is required when marking expense as paid")
        }
        
        if (!isPaid) {
            println("🔧 Marking expense as unpaid - no payment type needed")
        }

        // Update expense payment status
        val updatedExpense = expense.copy(
            isPaid = isPaid,
            paymentType = if (isPaid) paymentTypeRepository.findById(paymentTypeId!!).orElseThrow { RuntimeException("Payment type not found") } else null,
            paymentDate = if (isPaid) LocalDateTime.now() else null,
            referenceNumber = if (isPaid) referenceNumber else null,
            transactionId = if (isPaid) transactionId else null

        )
        val savedExpense = expenseRepository.save(updatedExpense)
        
        if (isPaid && paymentTypeId != null) {
            // If marking as paid, create payment record via PaymentService
            try {
                paymentService.createPaymentForExpense(
                    expenseId = expenseId,
                    paymentTypeId = paymentTypeId,
                    amount = amount,
                    referenceNumber = referenceNumber,
                    notes = notes,
                    transactionId = transactionId,
                    receiptUrl = receiptUrl
                )
            } catch (e: Exception) {
                // Log the error but don't fail the expense update
                println("Failed to create payment record: ${e.message}")
            }
        } else if (!isPaid) {
            // If marking as unpaid, soft delete existing payment records
            try {
                paymentService.deactivatePaymentForSession(expenseId, SessionType.EXPENSE)
            } catch (e: Exception) {
                // Log the error but don't fail the expense update
                println("Failed to deactivate payment records: ${e.message}")
            }
        }
        
        return mapToResponse(savedExpense)
    }





    private fun mapToResponse(expense: Expense): ExpenseResponse {
        return ExpenseResponse(
            id = expense.id,
            name = expense.name,
            description = expense.description,
            amount = expense.amount,
            currency = expense.currency,
            category = ExpenseCategoryResponse.fromEntity(expense.category),
            notes = expense.notes,
            expenseDate = expense.expenseDate,
            isRecurring = expense.isRecurring,
            recurrenceFrequency = expense.recurrenceFrequency,
            recurrenceCount = expense.recurrenceCount,
            nextDueDate = expense.nextDueDate,
            receiptUrl = expense.receiptUrl,
            
            // Payment-related fields
            isPaid = expense.isPaid,
            paymentType = expense.paymentType?.let { PaymentTypeResponse.fromEntity(it) },
            paymentDate = expense.paymentDate,
            referenceNumber = expense.referenceNumber,
            transactionId = expense.transactionId,
            
            createdAt = expense.createdAt,
            updatedAt = expense.updatedAt,
            isActive = expense.isActive
        )
    }
} 