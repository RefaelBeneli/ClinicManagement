package com.clinic.repository

import com.clinic.entity.MeetingSource
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MeetingSourceRepository : JpaRepository<MeetingSource, Long> {
    fun findByIsActiveTrue(): List<MeetingSource>
    fun existsByName(name: String): Boolean
} 