package com.clinic.repository

import com.clinic.entity.PersonalMeeting
import com.clinic.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface PersonalMeetingRepository : JpaRepository<PersonalMeeting, Long> {
    fun findByUser(user: User): List<PersonalMeeting>
    fun findByUserAndMeetingDateBetween(user: User, start: LocalDateTime, end: LocalDateTime): List<PersonalMeeting>
    
    @Query("SELECT pm FROM PersonalMeeting pm WHERE pm.user = :user AND YEAR(pm.meetingDate) = :year AND MONTH(pm.meetingDate) = :month")
    fun findByUserAndMonthYear(@Param("user") user: User, @Param("year") year: Int, @Param("month") month: Int): List<PersonalMeeting>
    
    fun findByUserAndIsPaidFalse(user: User): List<PersonalMeeting>
    
    fun existsByMeetingTypeId(meetingTypeId: Long): Boolean
} 