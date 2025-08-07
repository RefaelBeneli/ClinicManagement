package com.clinic.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "client_sources")
data class ClientSource(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false, unique = true)
    val name: String, // "Private", "Natal", "Clalit"
    
    @Column(nullable = false)
    val duration: Int = 60, // Default duration in minutes
    
    @Column(nullable = false, precision = 10, scale = 2)
    val price: BigDecimal, // Default price
    
    @Column(nullable = false, precision = 10, scale = 2)
    val noShowPrice: BigDecimal, // Price for no-show
    
    @Column(nullable = false)
    val defaultSessions: Int = 1, // Default number of sessions for recurring meetings
    
    @Column(nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 