package com.clinic.repository

import com.clinic.entity.Expense
import com.clinic.entity.ExpenseCategory
import com.clinic.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDate

@Repository
interface ExpenseRepository : JpaRepository<Expense, Long> {
    
    fun findByUser(user: User): List<Expense>
    
    fun findByUserAndIsRecurringTrue(user: User): List<Expense>
    
    fun findByUserAndCategory(user: User, category: ExpenseCategory): List<Expense>
    
    fun findByUserAndExpenseDateBetween(user: User, startDate: LocalDate, endDate: LocalDate): List<Expense>
    
    fun findByUserAndNextDueDateBefore(user: User, date: LocalDate): List<Expense>
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user = :user GROUP BY e.category")
    fun getCategoryBreakdown(@Param("user") user: User): List<Pair<ExpenseCategory, BigDecimal>>
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.isRecurring = true")
    fun getTotalRecurringAmount(@Param("user") user: User): BigDecimal?
    
    @Query("SELECT AVG(e.amount) FROM Expense e WHERE e.user = :user AND e.expenseDate BETWEEN :startDate AND :endDate")
    fun getAverageAmountForPeriod(@Param("user") user: User, @Param("startDate") startDate: LocalDate, @Param("endDate") endDate: LocalDate): BigDecimal?
    
    fun findTop5ByOrderByCreatedAtDesc(): List<Expense>
    
    // Payment-related methods
    fun findByUserAndIsPaidTrue(user: User): List<Expense>
    
    fun findByUserAndIsPaidFalse(user: User): List<Expense>
} 