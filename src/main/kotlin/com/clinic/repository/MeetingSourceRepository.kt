package com.clinic.repository

import com.clinic.entity.ClientSource
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ClientSourceRepository : JpaRepository<ClientSource, Long> {
    fun findByIsActiveTrue(): List<ClientSource>
    fun findByName(name: String): ClientSource?
} 