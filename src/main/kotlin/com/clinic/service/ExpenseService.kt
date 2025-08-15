package com.clinic.service

import com.clinic.dto.*
import com.clinic.entity.Expense
import com.clinic.entity.ExpenseCategory
import com.clinic.entity.PaymentType
import com.clinic.entity.User
import com.clinic.repository.ExpenseRepository
import com.clinic.repository.ExpenseCategoryRepository
import com.clinic.repository.PaymentTypeRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class ExpenseService {

    @Autowired
    private lateinit var expenseRepository: ExpenseRepository

    @Autowired
    private lateinit var expenseCategoryRepository: ExpenseCategoryRepository

    @Autowired
    private lateinit var paymentTypeRepository: PaymentTypeRepository

    @Autowired
    private lateinit var authService: AuthService

    fun createExpense(expenseRequest: ExpenseRequest): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        
        val category = expenseCategoryRepository.findById(expenseRequest.categoryId)
            .orElseThrow { RuntimeException("Expense category not found with id: ${expenseRequest.categoryId}") }
        
        val paymentType = expenseRequest.paymentTypeId?.let { paymentTypeId ->
            paymentTypeRepository.findById(paymentTypeId)
                .orElseThrow { RuntimeException("Payment type not found with id: $paymentTypeId") }
        }
        
        if (expenseRequest.isRecurring && expenseRequest.recurrenceCount != null && expenseRequest.recurrenceCount > 1) {
            return createRecurringExpenses(expenseRequest, currentUser, category, paymentType)
        } else {
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
                isPaid = expenseRequest.isPaid,
                paymentType = paymentType,
                receiptUrl = expenseRequest.receiptUrl
            )
            
            val savedExpense = expenseRepository.save(expense)
            return mapToResponse(savedExpense)
        }
    }

    private fun createRecurringExpenses(
        expenseRequest: ExpenseRequest,
        currentUser: User,
        category: ExpenseCategory,
        paymentType: PaymentType?
    ): ExpenseResponse {
        if (expenseRequest.recurrenceFrequency == null) {
            throw RuntimeException("Recurrence frequency is required for recurring expenses")
        }

        val recurrenceCount = expenseRequest.recurrenceCount ?: 1
        println("🔄 Creating recurring expenses: count=$recurrenceCount, frequency=${expenseRequest.recurrenceFrequency}")
        
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
            nextDueDate = if (recurrenceCount > 1) calculateNextExpenseDate(currentDate, expenseRequest.recurrenceFrequency) else null,
            isPaid = expenseRequest.isPaid,
            paymentType = paymentType,
            receiptUrl = expenseRequest.receiptUrl
        )
        val savedParentExpense = expenseRepository.save(parentExpense)
        expenses.add(savedParentExpense)
        println("✅ Created parent expense (occurrence 1)")

        // Create subsequent expenses
        for (occurrence in 2..recurrenceCount) {
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
                nextDueDate = if (occurrence < recurrenceCount) calculateNextExpenseDate(currentDate, expenseRequest.recurrenceFrequency) else null,
                isPaid = expenseRequest.isPaid,
                paymentType = paymentType,
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
        return expenseRepository.findByUser(currentUser)
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

        val paymentType = updateRequest.paymentTypeId?.let { paymentTypeId ->
            paymentTypeRepository.findById(paymentTypeId)
                .orElseThrow { RuntimeException("Payment type not found with id: $paymentTypeId") }
        } ?: expense.paymentType

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
            isPaid = updateRequest.isPaid ?: expense.isPaid,
            paymentType = paymentType,
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
        
        val totalPaid = expenseRepository.getTotalPaidAmount(currentUser) ?: BigDecimal.ZERO
        val totalUnpaid = expenseRepository.getTotalUnpaidAmount(currentUser) ?: BigDecimal.ZERO
        val totalRecurring = expenseRepository.getTotalRecurringAmount(currentUser) ?: BigDecimal.ZERO
        
        val totalExpenses = totalPaid + totalUnpaid
        
        // Calculate monthly average for the last 12 months
        val twelveMonthsAgo = LocalDate.now().minusMonths(12)
        val monthlyAverage = expenseRepository.getAverageAmountForPeriod(currentUser, twelveMonthsAgo, LocalDate.now()) ?: BigDecimal.ZERO
        
        // Get category breakdown
        val categoryBreakdown = expenseRepository.getCategoryBreakdown(currentUser)
            .associate { (category, amount) -> 
                category.name to (amount as BigDecimal)
            }
        
        return ExpenseSummaryResponse(
            totalExpenses = totalExpenses,
            paidExpenses = totalPaid,
            unpaidExpenses = totalUnpaid,
            recurringExpenses = totalRecurring,
            monthlyAverage = monthlyAverage,
            categoryBreakdown = categoryBreakdown
        )
    }

    fun markAsPaid(id: Long): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        val expense = expenseRepository.findById(id)
            .filter { it.user.id == currentUser.id }
            .orElseThrow { RuntimeException("Expense not found") }

        val updatedExpense = expense.copy(
            isPaid = true,
            updatedAt = LocalDateTime.now()
        )

        val savedExpense = expenseRepository.save(updatedExpense)
        return mapToResponse(savedExpense)
    }

    fun markAsUnpaid(id: Long): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        val expense = expenseRepository.findById(id)
            .filter { it.user.id == currentUser.id }
            .orElseThrow { RuntimeException("Expense not found") }

        val updatedExpense = expense.copy(
            isPaid = false,
            updatedAt = LocalDateTime.now()
        )

        val savedExpense = expenseRepository.save(updatedExpense)
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
            isPaid = expense.isPaid,
            paymentType = expense.paymentType?.let { PaymentTypeResponse.fromEntity(it) },
            receiptUrl = expense.receiptUrl,
            createdAt = expense.createdAt,
            updatedAt = expense.updatedAt,
            isActive = expense.isActive
        )
    }
} 