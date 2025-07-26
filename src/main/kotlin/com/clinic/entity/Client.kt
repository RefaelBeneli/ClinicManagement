package com.clinic.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "clients")
data class Client(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(name = "full_name", nullable = false)
    val fullName: String,
    
    @Column(nullable = true)
    val email: String? = null,
    
    @Column(nullable = true)
    val phone: String? = null,
    
    @Column(name = "date_of_birth", nullable = true)
    val dateOfBirth: String? = null,
    
    @Column(nullable = true, length = 1000)
    val notes: String? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true
) 