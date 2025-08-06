package com.clinic.service

import com.clinic.dto.ExpenseCategoryRequest
import com.clinic.dto.ExpenseCategoryResponse
import com.clinic.dto.UpdateExpenseCategoryRequest
import com.clinic.entity.ExpenseCategory
import com.clinic.repository.ExpenseCategoryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class ExpenseCategoryService(
    private val expenseCategoryRepository: ExpenseCategoryRepository
) {
    
    fun getAllCategories(): List<ExpenseCategoryResponse> {
        return expenseCategoryRepository.findAll()
            .map { ExpenseCategoryResponse.fromEntity(it) }
    }
    
    fun getActiveCategories(): List<ExpenseCategoryResponse> {
        return expenseCategoryRepository.findActiveCategories()
            .map { ExpenseCategoryResponse.fromEntity(it) }
    }
    
    fun getCategoryById(id: Long): ExpenseCategoryResponse {
        val category = expenseCategoryRepository.findById(id)
            .orElseThrow { RuntimeException("Expense category not found with id: $id") }
        return ExpenseCategoryResponse.fromEntity(category)
    }
    
    fun createCategory(request: ExpenseCategoryRequest): ExpenseCategoryResponse {
        if (expenseCategoryRepository.existsByName(request.name)) {
            throw RuntimeException("Expense category with name '${request.name}' already exists")
        }
        
        val category = ExpenseCategory(
            name = request.name,
            description = request.description,
            isActive = request.isActive
        )
        
        val savedCategory = expenseCategoryRepository.save(category)
        return ExpenseCategoryResponse.fromEntity(savedCategory)
    }
    
    fun updateCategory(id: Long, request: UpdateExpenseCategoryRequest): ExpenseCategoryResponse {
        val category = expenseCategoryRepository.findById(id)
            .orElseThrow { RuntimeException("Expense category not found with id: $id") }
        
        val updatedCategory = category.copy(
            name = request.name ?: category.name,
            description = request.description ?: category.description,
            isActive = request.isActive ?: category.isActive,
            updatedAt = LocalDateTime.now()
        )
        
        val savedCategory = expenseCategoryRepository.save(updatedCategory)
        return ExpenseCategoryResponse.fromEntity(savedCategory)
    }
    
    fun deleteCategory(id: Long) {
        val category = expenseCategoryRepository.findById(id)
            .orElseThrow { RuntimeException("Expense category not found with id: $id") }
        
        expenseCategoryRepository.delete(category)
    }
    
    fun toggleCategoryActive(id: Long): ExpenseCategoryResponse {
        val category = expenseCategoryRepository.findById(id)
            .orElseThrow { RuntimeException("Expense category not found with id: $id") }
        
        val updatedCategory = category.copy(
            isActive = !category.isActive,
            updatedAt = LocalDateTime.now()
        )
        
        val savedCategory = expenseCategoryRepository.save(updatedCategory)
        return ExpenseCategoryResponse.fromEntity(savedCategory)
    }
} 