package com.clinic.repository

import com.clinic.entity.Client
import com.clinic.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ClientRepository : JpaRepository<Client, Long> {
    fun findByUserAndIsActiveTrue(user: User): List<Client>
    fun findByUserAndFullNameContainingIgnoreCaseAndIsActiveTrue(user: User, name: String): List<Client>
    fun findByIdAndUser(id: Long, user: User): Client?
} 