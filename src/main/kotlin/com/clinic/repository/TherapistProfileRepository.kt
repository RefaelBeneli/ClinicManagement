package com.clinic.repository

import com.clinic.entity.TherapistProfile
import com.clinic.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface TherapistProfileRepository : JpaRepository<TherapistProfile, Long> {
    
    fun findByUser(user: User): Optional<TherapistProfile>
    
    fun findByUserId(userId: Long): Optional<TherapistProfile>
    
    fun existsByUser(user: User): Boolean
    
    // Find therapists accepting new clients
    fun findByIsAcceptingNewClientsTrue(): List<TherapistProfile>
    
    // Find therapists by specialization
    fun findBySpecializationContainingIgnoreCase(specialization: String): List<TherapistProfile>
    
    // Find therapists by language
    @Query("SELECT tp FROM TherapistProfile tp WHERE tp.languages LIKE %:language%")
    fun findByLanguageContaining(@Param("language") language: String): List<TherapistProfile>
    
    // Get all therapists for directory (include all roles)
    @Query("SELECT tp FROM TherapistProfile tp JOIN tp.user u WHERE u.role IN ('USER', 'ADMIN')")
    fun findAllTherapistProfiles(): List<TherapistProfile>
} 