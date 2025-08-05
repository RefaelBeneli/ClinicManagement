package com.clinic.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "payment_types")
data class PaymentType(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false, unique = true)
    val name: String, // "Bank Transfer", "Bit", "Paybox", "Cash"
    
    @Column(nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 