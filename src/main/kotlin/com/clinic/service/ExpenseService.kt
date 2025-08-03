package com.clinic.service

import com.clinic.dto.*
import com.clinic.entity.Expense
import com.clinic.entity.User
import com.clinic.repository.ExpenseRepository
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
    private lateinit var authService: AuthService

    fun createExpense(expenseRequest: ExpenseRequest): ExpenseResponse {
        val currentUser = authService.getCurrentUser()
        
        val expense = Expense(
            user = currentUser,
            name = expenseRequest.name,
            description = expenseRequest.description,
            amount = expenseRequest.amount,
            currency = expenseRequest.currency,
            category = expenseRequest.category,
            notes = expenseRequest.notes,
            expenseDate = expenseRequest.expenseDate,
            isRecurring = expenseRequest.isRecurring,
            recurrenceFrequency = expenseRequest.recurrenceFrequency,
            nextDueDate = expenseRequest.nextDueDate,
            isPaid = expenseRequest.isPaid,
            paymentMethod = expenseRequest.paymentMethod,
            receiptUrl = expenseRequest.receiptUrl
        )
        
        val savedExpense = expenseRepository.save(expense)
        return mapToResponse(savedExpense)
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

        val updatedExpense = expense.copy(
            name = updateRequest.name ?: expense.name,
            description = updateRequest.description,
            amount = updateRequest.amount ?: expense.amount,
            currency = updateRequest.currency ?: expense.currency,
            category = updateRequest.category ?: expense.category,
            notes = updateRequest.notes,
            expenseDate = updateRequest.expenseDate ?: expense.expenseDate,
            isRecurring = updateRequest.isRecurring ?: expense.isRecurring,
            recurrenceFrequency = updateRequest.recurrenceFrequency,
            nextDueDate = updateRequest.nextDueDate,
            isPaid = updateRequest.isPaid ?: expense.isPaid,
            paymentMethod = updateRequest.paymentMethod,
            receiptUrl = updateRequest.receiptUrl,
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

    fun getExpensesByCategory(category: String): List<ExpenseResponse> {
        val currentUser = authService.getCurrentUser()
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
                category.toString() to (amount as BigDecimal)
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
            category = expense.category,
            notes = expense.notes,
            expenseDate = expense.expenseDate,
            isRecurring = expense.isRecurring,
            recurrenceFrequency = expense.recurrenceFrequency,
            nextDueDate = expense.nextDueDate,
            isPaid = expense.isPaid,
            paymentMethod = expense.paymentMethod,
            receiptUrl = expense.receiptUrl,
            createdAt = expense.createdAt,
            updatedAt = expense.updatedAt
        )
    }
} 