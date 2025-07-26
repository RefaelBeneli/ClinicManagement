package com.clinic.service

import com.clinic.dto.MeetingRequest
import com.clinic.dto.MeetingResponse
import com.clinic.dto.UpdateMeetingRequest
import com.clinic.dto.ClientResponse
import com.clinic.entity.Meeting
import com.clinic.entity.MeetingStatus
import com.clinic.repository.MeetingRepository
import com.clinic.repository.ClientRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class MeetingService {

    @Autowired
    private lateinit var meetingRepository: MeetingRepository

    @Autowired
    private lateinit var clientRepository: ClientRepository

    @Autowired
    private lateinit var authService: AuthService

    fun createMeeting(meetingRequest: MeetingRequest): MeetingResponse {
        val currentUser = authService.getCurrentUser()
        val client = clientRepository.findByIdAndUser(meetingRequest.clientId, currentUser)
            ?: throw RuntimeException("Client not found")

        val meeting = Meeting(
            client = client,
            user = currentUser,
            meetingDate = meetingRequest.meetingDate,
            duration = meetingRequest.duration ?: 60,
            price = meetingRequest.price,
            notes = meetingRequest.notes
        )

        val savedMeeting = meetingRepository.save(meeting)
        return mapToResponse(savedMeeting)
    }

    fun getAllMeetings(): List<MeetingResponse> {
        val currentUser = authService.getCurrentUser()
        return meetingRepository.findByUser(currentUser)
            .map { mapToResponse(it) }
    }

    fun getMeetingById(id: Long): MeetingResponse {
        val currentUser = authService.getCurrentUser()
        val meeting = meetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Meeting not found")
        }

        return mapToResponse(meeting)
    }

    fun updateMeeting(id: Long, updateRequest: UpdateMeetingRequest): MeetingResponse {
        val currentUser = authService.getCurrentUser()
        val meeting = meetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Meeting not found")
        }

        val updatedMeeting = meeting.copy(
            meetingDate = updateRequest.meetingDate ?: meeting.meetingDate,
            duration = updateRequest.duration ?: meeting.duration,
            price = updateRequest.price ?: meeting.price,
            isPaid = updateRequest.isPaid ?: meeting.isPaid,
            notes = updateRequest.notes ?: meeting.notes,
            status = updateRequest.status ?: meeting.status,
            paymentDate = if (updateRequest.isPaid == true && meeting.paymentDate == null) {
                LocalDateTime.now()
            } else if (updateRequest.isPaid == false) {
                null
            } else {
                meeting.paymentDate
            }
        )

        val savedMeeting = meetingRepository.save(updatedMeeting)
        return mapToResponse(savedMeeting)
    }

    fun updatePaymentStatus(id: Long, isPaid: Boolean): MeetingResponse {
        val currentUser = authService.getCurrentUser()
        val meeting = meetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Meeting not found")
        }

        val updatedMeeting = meeting.copy(
            isPaid = isPaid,
            paymentDate = if (isPaid) LocalDateTime.now() else null
        )

        val savedMeeting = meetingRepository.save(updatedMeeting)
        return mapToResponse(savedMeeting)
    }

    fun deleteMeeting(id: Long) {
        val currentUser = authService.getCurrentUser()
        val meeting = meetingRepository.findById(id).orElse(null)
            ?: throw RuntimeException("Meeting not found")
        
        if (meeting.user.id != currentUser.id) {
            throw RuntimeException("Meeting not found")
        }

        meetingRepository.delete(meeting)
    }

    fun getMeetingsByMonth(year: Int, month: Int): List<MeetingResponse> {
        val currentUser = authService.getCurrentUser()
        return meetingRepository.findByUserAndMonthYear(currentUser, year, month)
            .map { mapToResponse(it) }
    }

    private fun mapToResponse(meeting: Meeting): MeetingResponse {
        return MeetingResponse(
            id = meeting.id,
            client = ClientResponse(
                id = meeting.client.id,
                fullName = meeting.client.fullName,
                email = meeting.client.email,
                phone = meeting.client.phone,
                dateOfBirth = meeting.client.dateOfBirth,
                notes = meeting.client.notes,
                createdAt = meeting.client.createdAt,
                isActive = meeting.client.isActive
            ),
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