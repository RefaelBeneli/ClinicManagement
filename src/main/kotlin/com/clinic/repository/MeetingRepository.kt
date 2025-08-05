package com.clinic.repository

import com.clinic.entity.Client
import com.clinic.entity.Meeting
import com.clinic.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface MeetingRepository : JpaRepository<Meeting, Long> {
    fun findByUser(user: User): List<Meeting>
    fun findByUserAndMeetingDateBetween(user: User, start: LocalDateTime, end: LocalDateTime): List<Meeting>
    fun findByClient(client: Client): List<Meeting>
    
    @Query("SELECT m FROM Meeting m WHERE m.user = :user AND YEAR(m.meetingDate) = :year AND MONTH(m.meetingDate) = :month")
    fun findByUserAndMonthYear(@Param("user") user: User, @Param("year") year: Int, @Param("month") month: Int): List<Meeting>
    
    fun findByUserAndIsPaidFalse(user: User): List<Meeting>
    
    fun existsByPaymentTypeId(paymentTypeId: Long): Boolean
} 