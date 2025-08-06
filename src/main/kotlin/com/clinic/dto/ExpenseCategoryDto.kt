package com.clinic.dto

import com.clinic.entity.ExpenseCategory
import java.time.LocalDateTime

data class ExpenseCategoryResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val isActive: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun fromEntity(entity: ExpenseCategory): ExpenseCategoryResponse {
            return ExpenseCategoryResponse(
                id = entity.id,
                name = entity.name,
                description = entity.description,
                isActive = entity.isActive,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt
            )
        }
    }
}

data class ExpenseCategoryRequest(
    val name: String,
    val description: String? = null,
    val isActive: Boolean = true
)

data class UpdateExpenseCategoryRequest(
    val name: String? = null,
    val description: String? = null,
    val isActive: Boolean? = null
) 