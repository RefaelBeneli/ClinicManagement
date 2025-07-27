package com.clinic.service

import com.clinic.dto.PersonalMeetingRequest
import com.clinic.dto.PersonalMeetingResponse
import com.clinic.dto.UpdatePersonalMeetingRequest
import com.clinic.entity.PersonalMeeting
import com.clinic.entity.PersonalMeetingStatus
import com.clinic.repository.PersonalMeetingRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.LocalDate

@Service
class PersonalMeetingService {

    @Autowired
    private lateinit var personalMeetingRepository: PersonalMeetingRepository

    @Autowired
    private lateinit var authService: AuthService

    fun createPersonalMeeting(meetingRequest: PersonalMeetingRequest): PersonalMeetingResponse {
        val currentUser = authService.getCurrentUser()

        val meeting = PersonalMeeting(
            user = currentUser,
            therapistName = meetingRequest.therapistName,
            meetingDate = meetingRequest.meetingDate,
            duration = meetingRequest.duration ?: 60,
            price = meetingRequest.price,
            notes = meetingRequest.notes
        )

        val savedMeeting = personalMeetingRepository.save(meeting)
        return mapToResponse(savedMeeting)
    }

    fun getAllPersonalMeetings(): List<PersonalMeetingResponse> {
        val currentUser = authService.getCurrentUser()
        return personalMeetingRepository.findByUser(currentUser)
            .map { mapToResponse(it) }
    }

    fun getPersonalMeetingById(id: Long): PersonalMeetingResponse {
        val currentUser = authService.getCurrentUser()
        val meeting = personalMeetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Personal meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Personal meeting not found")
        }

        return mapToResponse(meeting)
    }

    fun updatePersonalMeeting(id: Long, updateRequest: UpdatePersonalMeetingRequest): PersonalMeetingResponse {
        val currentUser = authService.getCurrentUser()
        val meeting = personalMeetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Personal meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Personal meeting not found")
        }

        val updatedMeeting = meeting.copy(
            therapistName = updateRequest.therapistName ?: meeting.therapistName,
            meetingDate = updateRequest.meetingDate ?: meeting.meetingDate,
            duration = updateRequest.duration ?: meeting.duration,
            price = updateRequest.price ?: meeting.price,
            isPaid = updateRequest.isPaid ?: meeting.isPaid,
            notes = updateRequest.notes ?: meeting.notes,
            status = updateRequest.status ?: meeting.status
        )

        val savedMeeting = personalMeetingRepository.save(updatedMeeting)
        return mapToResponse(savedMeeting)
    }

    fun updatePaymentStatus(id: Long, isPaid: Boolean): PersonalMeetingResponse {
        val currentUser = authService.getCurrentUser()
        val meeting = personalMeetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Personal meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Personal meeting not found")
        }

        val updatedMeeting = meeting.copy(
            isPaid = isPaid,
            paymentDate = if (isPaid) LocalDateTime.now() else null
        )

        val savedMeeting = personalMeetingRepository.save(updatedMeeting)
        return mapToResponse(savedMeeting)
    }

    fun deletePersonalMeeting(id: Long) {
        val currentUser = authService.getCurrentUser()
        val meeting = personalMeetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Personal meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Personal meeting not found")
        }

        personalMeetingRepository.delete(meeting)
    }

    fun getPersonalMeetingsByMonth(year: Int, month: Int): List<PersonalMeetingResponse> {
        val currentUser = authService.getCurrentUser()
        return personalMeetingRepository.findByUserAndMonthYear(currentUser, year, month)
            .map { mapToResponse(it) }
    }

    fun getPersonalMeetingStats(): Map<String, Any> {
        val currentUser = authService.getCurrentUser()
        val today = LocalDateTime.now().toLocalDate().atStartOfDay()
        val monthStart = LocalDateTime.now().toLocalDate().withDayOfMonth(1).atStartOfDay()
        
        // Today's personal meetings
        val todayMeetings = personalMeetingRepository.findByUserAndMeetingDateBetween(
            currentUser, 
            today, 
            today.plusDays(1)
        )
        
        // This month's personal meetings
        val monthlyMeetings = personalMeetingRepository.findByUserAndMeetingDateBetween(
            currentUser,
            monthStart,
            monthStart.plusMonths(1)
        )
        
        val unpaidSessions = monthlyMeetings.filter { !it.isPaid }.size
        val monthlySpent = monthlyMeetings.filter { it.isPaid }.sumOf { it.price }
        val totalSessions = monthlyMeetings.size
        
        return mapOf(
            "personalMeetingsToday" to todayMeetings.size,
            "unpaidPersonalSessions" to unpaidSessions,
            "monthlyPersonalSpent" to monthlySpent,
            "totalPersonalSessions" to totalSessions,
            "paidPersonalSessions" to (totalSessions - unpaidSessions)
        )
    }

    private fun mapToResponse(meeting: PersonalMeeting): PersonalMeetingResponse {
        return PersonalMeetingResponse(
            id = meeting.id,
            therapistName = meeting.therapistName,
            meetingDate = meeting.meetingDate,
            duration = meeting.duration,
            price = meeting.price,
            isPaid = meeting.isPaid,
            paymentDate = meeting.paymentDate,
            notes = meeting.notes,
            status = meeting.status,
            createdAt = meeting.createdAt
        )
    }
} 