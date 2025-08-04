package com.clinic.security

import com.clinic.entity.*
import com.clinic.repository.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ResourceOwnershipValidator {

    @Autowired
    private lateinit var meetingRepository: MeetingRepository

    @Autowired
    private lateinit var clientRepository: ClientRepository

    @Autowired
    private lateinit var expenseRepository: ExpenseRepository

    @Autowired
    private lateinit var personalMeetingRepository: PersonalMeetingRepository

    fun validateMeetingOwnership(meetingId: Long, userId: Long): Boolean {
        val meeting = meetingRepository.findById(meetingId).orElse(null) ?: return false
        return meeting.user.id == userId || meeting.user.role == Role.ADMIN
    }

    fun validateClientOwnership(clientId: Long, userId: Long): Boolean {
        val client = clientRepository.findById(clientId).orElse(null) ?: return false
        return client.user.id == userId || client.user.role == Role.ADMIN
    }

    fun validateExpenseOwnership(expenseId: Long, userId: Long): Boolean {
        val expense = expenseRepository.findById(expenseId).orElse(null) ?: return false
        return expense.user.id == userId || expense.user.role == Role.ADMIN
    }

    fun validatePersonalMeetingOwnership(personalMeetingId: Long, userId: Long): Boolean {
        val personalMeeting = personalMeetingRepository.findById(personalMeetingId).orElse(null) ?: return false
        return personalMeeting.user.id == userId || personalMeeting.user.role == Role.ADMIN
    }

    fun isAdmin(userId: Long): Boolean {
        // This would need to be implemented by loading the user and checking their role
        // For now, we'll rely on the individual validation methods
        return false
    }

    fun validateResourceAccess(resourceType: String, resourceId: Long, userId: Long): Boolean {
        return when (resourceType.lowercase()) {
            "meeting" -> validateMeetingOwnership(resourceId, userId)
            "client" -> validateClientOwnership(resourceId, userId)
            "expense" -> validateExpenseOwnership(resourceId, userId)
            "personalmeeting" -> validatePersonalMeetingOwnership(resourceId, userId)
            else -> false
        }
    }
} 