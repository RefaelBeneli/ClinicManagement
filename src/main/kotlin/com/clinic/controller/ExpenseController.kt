package com.clinic.controller

import com.clinic.dto.*
import com.clinic.service.ExpenseService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/expenses")
class ExpenseController {

    @Autowired
    private lateinit var expenseService: ExpenseService

    @PostMapping
    fun createExpense(@Valid @RequestBody expenseRequest: ExpenseRequest): ResponseEntity<*> {
        return try {
            val expense = expenseService.createExpense(expenseRequest)
            ResponseEntity.ok(expense)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error creating expense: ${e.message}"))
        }
    }

    @GetMapping
    fun getAllExpenses(): ResponseEntity<*> {
        return try {
            val expenses = expenseService.getAllExpenses()
            ResponseEntity.ok(expenses)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting expenses: ${e.message}"))
        }
    }

    @GetMapping("/{id}")
    fun getExpenseById(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            val expense = expenseService.getExpenseById(id)
            ResponseEntity.ok(expense)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting expense: ${e.message}"))
        }
    }

    @PutMapping("/{id}")
    fun updateExpense(@PathVariable id: Long, @Valid @RequestBody updateRequest: UpdateExpenseRequest): ResponseEntity<*> {
        return try {
            val expense = expenseService.updateExpense(id, updateRequest)
            ResponseEntity.ok(expense)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error updating expense: ${e.message}"))
        }
    }

    @DeleteMapping("/{id}")
    fun deleteExpense(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            expenseService.deleteExpense(id)
            ResponseEntity.ok(MessageResponse("Expense disabled successfully"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error disabling expense: ${e.message}"))
        }
    }

    @PatchMapping("/{id}/disable")
    fun disableExpense(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            expenseService.deleteExpense(id) // This now does soft delete
            ResponseEntity.ok(MessageResponse("Expense disabled successfully"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error disabling expense: ${e.message}"))
        }
    }

    @GetMapping("/category/{categoryId}")
    fun getExpensesByCategory(@PathVariable categoryId: Long): ResponseEntity<*> {
        return try {
            val expenses = expenseService.getExpensesByCategory(categoryId)
            ResponseEntity.ok(expenses)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting expenses by category: ${e.message}"))
        }
    }

    @GetMapping("/date-range")
    fun getExpensesByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate
    ): ResponseEntity<*> {
        return try {
            val expenses = expenseService.getExpensesByDateRange(startDate, endDate)
            ResponseEntity.ok(expenses)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting expenses by date range: ${e.message}"))
        }
    }

    // Payment-related endpoints
    @PutMapping("/{id}/payment")
    fun markExpenseAsPaid(
        @PathVariable id: Long,
        @Valid @RequestBody paymentRequest: ExpensePaymentRequest
    ): ResponseEntity<*> {
        return try {
            val expense = expenseService.markExpenseAsPaid(
                expenseId = id,
                paymentTypeId = paymentRequest.paymentTypeId,
                referenceNumber = paymentRequest.referenceNumber,
                notes = paymentRequest.notes,
                transactionId = paymentRequest.transactionId
            )
            ResponseEntity.ok(expense)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error marking expense as paid: ${e.message}"))
        }
    }

    @PutMapping("/{id}/unpaid")
    fun markExpenseAsUnpaid(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            val expense = expenseService.markExpenseAsUnpaid(id)
            ResponseEntity.ok(expense)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error marking expense as unpaid: ${e.message}"))
        }
    }

    @GetMapping("/recurring")
    fun getRecurringExpenses(): ResponseEntity<*> {
        return try {
            val expenses = expenseService.getRecurringExpenses()
            ResponseEntity.ok(expenses)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting recurring expenses: ${e.message}"))
        }
    }

    @GetMapping("/upcoming")
    fun getUpcomingExpenses(): ResponseEntity<*> {
        return try {
            val expenses = expenseService.getUpcomingExpenses()
            ResponseEntity.ok(expenses)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting upcoming expenses: ${e.message}"))
        }
    }

    @GetMapping("/summary")
    fun getExpenseSummary(): ResponseEntity<*> {
        return try {
            val summary = expenseService.getExpenseSummary()
            ResponseEntity.ok(summary)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting expense summary: ${e.message}"))
        }
    }



    @PostMapping("/{id}/activate")
    fun activateExpense(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            val expense = expenseService.activateExpense(id)
            ResponseEntity.ok(expense)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error activating expense: ${e.message}"))
        }
    }

    @PostMapping("/{id}/deactivate")
    fun deactivateExpense(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            val expense = expenseService.deactivateExpense(id)
            ResponseEntity.ok(expense)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error deactivating expense: ${e.message}"))
        }
    }
} 