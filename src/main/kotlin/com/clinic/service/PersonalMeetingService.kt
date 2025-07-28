package com.clinic.service

import com.clinic.dto.PersonalMeetingRequest
import com.clinic.dto.PersonalMeetingResponse
import com.clinic.dto.UpdatePersonalMeetingRequest
import com.clinic.entity.PersonalMeeting
import com.clinic.entity.PersonalMeetingStatus
import com.clinic.entity.PersonalMeetingType
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
            meetingType = meetingRequest.meetingType,
            providerType = meetingRequest.providerType,
            providerCredentials = meetingRequest.providerCredentials,
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
            meetingType = updateRequest.meetingType ?: meeting.meetingType,
            providerType = updateRequest.providerType ?: meeting.providerType,
            providerCredentials = updateRequest.providerCredentials ?: meeting.providerCredentials,
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
        
        val today = LocalDateTime.now().toLocalDate()
        val startOfToday = today.atStartOfDay()
        val endOfToday = today.plusDays(1).atStartOfDay()
        
        val todayMeetings = personalMeetingRepository.findByUserAndMeetingDateBetween(
            currentUser, 
            startOfToday, 
            endOfToday
        )
        
        val startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
        val endOfMonth = startOfMonth.plusMonths(1)
        
        val monthlyMeetings = personalMeetingRepository.findByUserAndMeetingDateBetween(
            currentUser,
            startOfMonth,
            endOfMonth
        )
        
        val unpaidMeetings = personalMeetingRepository.findByUserAndIsPaidFalse(currentUser)
        val totalMeetings = personalMeetingRepository.findByUser(currentUser)
        val paidMeetings = totalMeetings.filter { it.isPaid }
        val monthlySpent = monthlyMeetings.filter { it.isPaid }.sumOf { it.price }
        
        // Stats by meeting type
        val statsByType = totalMeetings.groupBy { it.meetingType }
            .mapValues { (_, meetings) ->
                mapOf(
                    "count" to meetings.size,
                    "paid" to meetings.count { it.isPaid },
                    "totalSpent" to meetings.filter { it.isPaid }.sumOf { it.price }
                )
            }

        return mapOf(
            "personalMeetingsToday" to todayMeetings.size,
            "unpaidPersonalSessions" to unpaidMeetings.size,
            "monthlyPersonalSpent" to monthlySpent,
            "totalPersonalSessions" to totalMeetings.size,
            "paidPersonalSessions" to paidMeetings.size,
            "statsByType" to statsByType
        )
    }

    fun getMeetingTypes(): List<PersonalMeetingType> {
        return PersonalMeetingType.values().toList()
    }

    private fun mapToResponse(meeting: PersonalMeeting): PersonalMeetingResponse {
        return PersonalMeetingResponse(
            id = meeting.id,
            therapistName = meeting.therapistName,
            meetingType = meeting.meetingType,
            providerType = meeting.providerType,
            providerCredentials = meeting.providerCredentials,
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