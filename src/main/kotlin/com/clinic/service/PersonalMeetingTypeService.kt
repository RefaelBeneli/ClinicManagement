package com.clinic.service

import com.clinic.dto.PersonalMeetingTypeRequest
import com.clinic.dto.PersonalMeetingTypeResponse
import com.clinic.dto.UpdatePersonalMeetingTypeRequest
import com.clinic.entity.PersonalMeetingType
import com.clinic.repository.PersonalMeetingRepository
import com.clinic.repository.PersonalMeetingTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class PersonalMeetingTypeService(
    private val personalMeetingTypeRepository: PersonalMeetingTypeRepository,
    private val personalMeetingRepository: PersonalMeetingRepository
) {
    fun getAllPersonalMeetingTypes(): List<PersonalMeetingTypeResponse> {
        return personalMeetingTypeRepository.findAll()
            .map { it.toResponse() }
    }
    
    fun getActivePersonalMeetingTypes(): List<PersonalMeetingTypeResponse> {
        return personalMeetingTypeRepository.findByIsActiveTrue()
            .map { it.toResponse() }
    }
    
    fun getPersonalMeetingTypeById(id: Long): PersonalMeetingTypeResponse {
        val meetingType = personalMeetingTypeRepository.findById(id)
            .orElseThrow { RuntimeException("Personal meeting type not found with id: $id") }
        return meetingType.toResponse()
    }
    
    fun createPersonalMeetingType(request: PersonalMeetingTypeRequest): PersonalMeetingTypeResponse {
        // Check if name already exists
        if (personalMeetingTypeRepository.existsByName(request.name)) {
            throw RuntimeException("Personal meeting type with name '${request.name}' already exists")
        }
        
        val meetingType = PersonalMeetingType(
            name = request.name,
            duration = request.duration,
            price = request.price,
            isRecurring = request.isRecurring,
            recurrenceFrequency = request.recurrenceFrequency
        )
        return personalMeetingTypeRepository.save(meetingType).toResponse()
    }
    
    fun updatePersonalMeetingType(id: Long, request: UpdatePersonalMeetingTypeRequest): PersonalMeetingTypeResponse {
        val meetingType = personalMeetingTypeRepository.findById(id)
            .orElseThrow { RuntimeException("Personal meeting type not found with id: $id") }
        
        // Check if new name conflicts with existing meeting types
        if (request.name != null && request.name != meetingType.name) {
            if (personalMeetingTypeRepository.existsByName(request.name)) {
                throw RuntimeException("Personal meeting type with name '${request.name}' already exists")
            }
        }
        
        val updated = meetingType.copy(
            name = request.name ?: meetingType.name,
            duration = request.duration ?: meetingType.duration,
            price = request.price ?: meetingType.price,
            isRecurring = request.isRecurring ?: meetingType.isRecurring,
            recurrenceFrequency = request.recurrenceFrequency ?: meetingType.recurrenceFrequency,
            isActive = request.isActive ?: meetingType.isActive,
            updatedAt = LocalDateTime.now()
        )
        return personalMeetingTypeRepository.save(updated).toResponse()
    }
    
    fun deletePersonalMeetingType(id: Long) {
        val meetingType = personalMeetingTypeRepository.findById(id)
            .orElseThrow { RuntimeException("Personal meeting type not found with id: $id") }
        
        // Check if meeting type is used in personal meetings
        if (personalMeetingRepository.existsByMeetingTypeId(id)) {
            throw RuntimeException("Cannot delete personal meeting type that is used in personal meetings")
        }
        
        personalMeetingTypeRepository.deleteById(id)
    }
    
    fun togglePersonalMeetingTypeActive(id: Long): PersonalMeetingTypeResponse {
        val meetingType = personalMeetingTypeRepository.findById(id)
            .orElseThrow { RuntimeException("Personal meeting type not found with id: $id") }
        
        val updated = meetingType.copy(
            isActive = !meetingType.isActive,
            updatedAt = LocalDateTime.now()
        )
        return personalMeetingTypeRepository.save(updated).toResponse()
    }
    
    private fun PersonalMeetingType.toResponse(): PersonalMeetingTypeResponse {
        return PersonalMeetingTypeResponse(
            id = this.id,
            name = this.name,
            duration = this.duration,
            price = this.price,
            isRecurring = this.isRecurring,
            recurrenceFrequency = this.recurrenceFrequency,
            isActive = this.isActive,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
} 