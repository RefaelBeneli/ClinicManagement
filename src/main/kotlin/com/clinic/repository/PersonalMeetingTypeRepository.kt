package com.clinic.repository

import com.clinic.entity.PersonalMeetingType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PersonalMeetingTypeRepository : JpaRepository<PersonalMeetingType, Long> {
    fun findByIsActiveTrue(): List<PersonalMeetingType>
    fun existsByName(name: String): Boolean
} 