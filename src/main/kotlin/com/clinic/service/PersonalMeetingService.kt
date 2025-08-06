package com.clinic.service

import com.clinic.dto.PersonalMeetingRequest
import com.clinic.dto.PersonalMeetingResponse
import com.clinic.dto.UpdatePersonalMeetingRequest
import com.clinic.entity.PersonalMeeting
import com.clinic.entity.PersonalMeetingStatus
import com.clinic.dto.PersonalMeetingTypeResponse
import com.clinic.repository.PersonalMeetingRepository
import com.clinic.repository.PersonalMeetingTypeRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class PersonalMeetingService {

    @Autowired
    private lateinit var personalMeetingRepository: PersonalMeetingRepository

    @Autowired
    private lateinit var personalMeetingTypeRepository: PersonalMeetingTypeRepository

    @Autowired
    private lateinit var authService: AuthService

    @Autowired
    private lateinit var expenseService: ExpenseService

    fun createPersonalMeeting(meetingRequest: PersonalMeetingRequest): PersonalMeetingResponse {
        val currentUser = authService.getCurrentUser()

        val meetingType = personalMeetingTypeRepository.findById(meetingRequest.meetingTypeId)
            .orElseThrow { RuntimeException("Personal meeting type not found with id: ${meetingRequest.meetingTypeId}") }

        val meeting = PersonalMeeting(
            user = currentUser,
            therapistName = meetingRequest.therapistName,
            meetingType = meetingType,
            providerType = meetingRequest.providerType,
            providerCredentials = meetingRequest.providerCredentials,
            meetingDate = meetingRequest.meetingDate,
            duration = meetingRequest.duration ?: 60,
            price = meetingRequest.price,
            notes = meetingRequest.notes,
            summary = meetingRequest.summary,
            isRecurring = meetingRequest.isRecurring,
            recurrenceFrequency = meetingRequest.recurrenceFrequency,
            nextDueDate = meetingRequest.nextDueDate
        )

        val savedMeeting = personalMeetingRepository.save(meeting)

        // If this is a session with a Guide, automatically create a recurring expense
        if (meetingRequest.providerType.equals("Guide", ignoreCase = true)) {
            createGuideExpense(savedMeeting)
        }

        return mapToResponse(savedMeeting)
    }

    private fun createGuideExpense(personalMeeting: PersonalMeeting) {
        val expenseRequest = com.clinic.dto.ExpenseRequest(
            name = "Guide Session - ${personalMeeting.therapistName}",
            description = "Personal session with guide: ${personalMeeting.meetingType.name}",
            amount = personalMeeting.price,
            currency = "ILS",
            categoryId = 1, // Default to "Other" category
            notes = "Auto-created from personal meeting with guide",
            expenseDate = personalMeeting.meetingDate.toLocalDate(),
            isRecurring = personalMeeting.isRecurring,
            recurrenceFrequency = personalMeeting.recurrenceFrequency,
            nextDueDate = personalMeeting.nextDueDate,
            isPaid = personalMeeting.isPaid,
            paymentTypeId = null,
            receiptUrl = null
        )

        try {
            expenseService.createExpense(expenseRequest)
        } catch (e: Exception) {
            // Log the error but don't fail the personal meeting creation
            println("Failed to create guide expense: ${e.message}")
        }
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
            meetingType = updateRequest.meetingTypeId?.let { typeId ->
                personalMeetingTypeRepository.findById(typeId)
                    .orElseThrow { RuntimeException("Personal meeting type not found with id: $typeId") }
            } ?: meeting.meetingType,
            providerType = updateRequest.providerType ?: meeting.providerType,
            providerCredentials = updateRequest.providerCredentials ?: meeting.providerCredentials,
            meetingDate = updateRequest.meetingDate ?: meeting.meetingDate,
            duration = updateRequest.duration ?: meeting.duration,
            price = updateRequest.price ?: meeting.price,
            isPaid = updateRequest.isPaid ?: meeting.isPaid,
            notes = updateRequest.notes ?: meeting.notes,
            summary = updateRequest.summary ?: meeting.summary,
            status = updateRequest.status ?: meeting.status,
            isRecurring = updateRequest.isRecurring ?: meeting.isRecurring,
            recurrenceFrequency = updateRequest.recurrenceFrequency ?: meeting.recurrenceFrequency,
            nextDueDate = updateRequest.nextDueDate ?: meeting.nextDueDate
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

        // Soft delete instead of hard delete
        val deactivatedMeeting = meeting.copy(isActive = false)
        personalMeetingRepository.save(deactivatedMeeting)
    }

    fun activatePersonalMeeting(id: Long): PersonalMeetingResponse {
        val currentUser = authService.getCurrentUser()
        val meeting = personalMeetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Personal meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Personal meeting not found")
        }

        val activatedMeeting = meeting.copy(isActive = true)
        val savedMeeting = personalMeetingRepository.save(activatedMeeting)
        return mapToResponse(savedMeeting)
    }

    fun deactivatePersonalMeeting(id: Long): PersonalMeetingResponse {
        val currentUser = authService.getCurrentUser()
        val meeting = personalMeetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Personal meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Personal meeting not found")
        }

        val deactivatedMeeting = meeting.copy(isActive = false)
        val savedMeeting = personalMeetingRepository.save(deactivatedMeeting)
        return mapToResponse(savedMeeting)
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

        // Stats by provider type
        val statsByProvider = totalMeetings.groupBy { it.providerType }
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
            "statsByType" to statsByType,
            "statsByProvider" to statsByProvider
        )
    }

    fun getMeetingTypes(): List<PersonalMeetingTypeResponse> {
        return personalMeetingTypeRepository.findByIsActiveTrue()
            .map { meetingType ->
                PersonalMeetingTypeResponse(
                    id = meetingType.id,
                    name = meetingType.name,
                    duration = meetingType.duration,
                    price = meetingType.price,
                    isRecurring = meetingType.isRecurring,
                    recurrenceFrequency = meetingType.recurrenceFrequency,
                    isActive = meetingType.isActive,
                    createdAt = meetingType.createdAt,
                    updatedAt = meetingType.updatedAt
                )
            }
    }

    fun getProviderTypes(): List<String> {
        return listOf("Therapist", "Guide", "Supervisor", "Teacher")
    }

    private fun mapToResponse(meeting: PersonalMeeting): PersonalMeetingResponse {
        return PersonalMeetingResponse(
            id = meeting.id,
            therapistName = meeting.therapistName,
            meetingType = PersonalMeetingTypeResponse(
                id = meeting.meetingType.id,
                name = meeting.meetingType.name,
                duration = meeting.meetingType.duration,
                price = meeting.meetingType.price,
                isRecurring = meeting.meetingType.isRecurring,
                recurrenceFrequency = meeting.meetingType.recurrenceFrequency,
                isActive = meeting.meetingType.isActive,
                createdAt = meeting.meetingType.createdAt,
                updatedAt = meeting.meetingType.updatedAt
            ),
            providerType = meeting.providerType,
            providerCredentials = meeting.providerCredentials,
            meetingDate = meeting.meetingDate,
            duration = meeting.duration,
            price = meeting.price,
            isPaid = meeting.isPaid,
            paymentDate = meeting.paymentDate,
            notes = meeting.notes,
            summary = meeting.summary,
            status = meeting.status,
            isRecurring = meeting.isRecurring,
            recurrenceFrequency = meeting.recurrenceFrequency,
            nextDueDate = meeting.nextDueDate,
            createdAt = meeting.createdAt,
            isActive = meeting.isActive
        )
    }
} 