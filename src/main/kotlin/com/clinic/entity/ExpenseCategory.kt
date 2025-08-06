package com.clinic.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "expense_categories")
data class ExpenseCategory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false, unique = true)
    val name: String, // "Office Supplies", "Rent", "Equipment", "Marketing", etc.
    
    @Column(columnDefinition = "TEXT")
    val description: String? = null,
    
    @Column(nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 