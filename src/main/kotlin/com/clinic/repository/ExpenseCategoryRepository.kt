package com.clinic.repository

import com.clinic.entity.ExpenseCategory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ExpenseCategoryRepository : JpaRepository<ExpenseCategory, Long> {
    
    @Query("SELECT ec FROM ExpenseCategory ec WHERE ec.isActive = true ORDER BY ec.name")
    fun findActiveCategories(): List<ExpenseCategory>
    
    fun findByName(name: String): ExpenseCategory?
    
    fun existsByName(name: String): Boolean
} 