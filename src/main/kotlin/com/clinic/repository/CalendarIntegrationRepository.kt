package com.clinic.repository

import com.clinic.entity.CalendarIntegration
import com.clinic.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface CalendarIntegrationRepository : JpaRepository<CalendarIntegration, Long> {
    
    fun findByUser(user: User): Optional<CalendarIntegration>
    
    fun findByUserId(userId: Long): Optional<CalendarIntegration>
    
    fun existsByUser(user: User): Boolean
    
    // Find users with sync enabled
    @Query("SELECT ci FROM CalendarIntegration ci WHERE ci.syncEnabled = true")
    fun findAllWithSyncEnabled(): List<CalendarIntegration>
    
    // Find users with client session sync enabled
    @Query("SELECT ci FROM CalendarIntegration ci WHERE ci.syncEnabled = true AND ci.syncClientSessions = true")
    fun findAllWithClientSessionSyncEnabled(): List<CalendarIntegration>
    
    // Find users with personal meeting sync enabled
    @Query("SELECT ci FROM CalendarIntegration ci WHERE ci.syncEnabled = true AND ci.syncPersonalMeetings = true")
    fun findAllWithPersonalMeetingSyncEnabled(): List<CalendarIntegration>
    
    // Find integrations that need token refresh (expiring soon)
    @Query("SELECT ci FROM CalendarIntegration ci WHERE ci.tokenExpiry IS NOT NULL AND ci.tokenExpiry < CURRENT_TIMESTAMP")
    fun findIntegrationsWithExpiredTokens(): List<CalendarIntegration>
} 