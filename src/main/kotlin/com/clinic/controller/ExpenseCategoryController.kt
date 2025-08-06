package com.clinic.controller

import com.clinic.dto.ExpenseCategoryRequest
import com.clinic.dto.ExpenseCategoryResponse
import com.clinic.dto.UpdateExpenseCategoryRequest
import com.clinic.service.ExpenseCategoryService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/expense-categories")
class ExpenseCategoryController(
    private val expenseCategoryService: ExpenseCategoryService
) {
    
    @GetMapping
    fun getAllCategories(): ResponseEntity<List<ExpenseCategoryResponse>> {
        val categories = expenseCategoryService.getAllCategories()
        return ResponseEntity.ok(categories)
    }
    
    @GetMapping("/active")
    fun getActiveCategories(): ResponseEntity<List<ExpenseCategoryResponse>> {
        val categories = expenseCategoryService.getActiveCategories()
        return ResponseEntity.ok(categories)
    }
    
    @GetMapping("/{id}")
    fun getCategoryById(@PathVariable id: Long): ResponseEntity<ExpenseCategoryResponse> {
        val category = expenseCategoryService.getCategoryById(id)
        return ResponseEntity.ok(category)
    }
    
    @PostMapping
    fun createCategory(@RequestBody request: ExpenseCategoryRequest): ResponseEntity<ExpenseCategoryResponse> {
        val category = expenseCategoryService.createCategory(request)
        return ResponseEntity.ok(category)
    }
    
    @PutMapping("/{id}")
    fun updateCategory(
        @PathVariable id: Long,
        @RequestBody request: UpdateExpenseCategoryRequest
    ): ResponseEntity<ExpenseCategoryResponse> {
        val category = expenseCategoryService.updateCategory(id, request)
        return ResponseEntity.ok(category)
    }
    
    @DeleteMapping("/{id}")
    fun deleteCategory(@PathVariable id: Long): ResponseEntity<Void> {
        expenseCategoryService.deleteCategory(id)
        return ResponseEntity.ok().build()
    }
    
    @PatchMapping("/{id}/toggle")
    fun toggleCategoryActive(@PathVariable id: Long): ResponseEntity<ExpenseCategoryResponse> {
        val category = expenseCategoryService.toggleCategoryActive(id)
        return ResponseEntity.ok(category)
    }
} 