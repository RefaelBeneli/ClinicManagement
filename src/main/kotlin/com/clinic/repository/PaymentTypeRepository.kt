package com.clinic.repository

import com.clinic.entity.PaymentType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PaymentTypeRepository : JpaRepository<PaymentType, Long> {
    fun findByIsActiveTrue(): List<PaymentType>
    fun existsByName(name: String): Boolean
} 