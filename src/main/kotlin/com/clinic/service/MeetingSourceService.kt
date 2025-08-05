package com.clinic.service

import com.clinic.dto.MeetingSourceRequest
import com.clinic.dto.MeetingSourceResponse
import com.clinic.dto.UpdateMeetingSourceRequest
import com.clinic.entity.MeetingSource
import com.clinic.repository.MeetingRepository
import com.clinic.repository.MeetingSourceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class MeetingSourceService(
    private val meetingSourceRepository: MeetingSourceRepository,
    private val meetingRepository: MeetingRepository
) {
    fun getAllSources(): List<MeetingSourceResponse> {
        return meetingSourceRepository.findAll()
            .map { it.toResponse() }
    }
    
    fun getActiveSources(): List<MeetingSourceResponse> {
        return meetingSourceRepository.findByIsActiveTrue()
            .map { it.toResponse() }
    }
    
    fun getSourceById(id: Long): MeetingSourceResponse {
        val source = meetingSourceRepository.findById(id)
            .orElseThrow { RuntimeException("Meeting source not found with id: $id") }
        return source.toResponse()
    }
    
    fun createSource(request: MeetingSourceRequest): MeetingSourceResponse {
        // Check if name already exists
        if (meetingSourceRepository.existsByName(request.name)) {
            throw RuntimeException("Source with name '${request.name}' already exists")
        }
        
        val source = MeetingSource(
            name = request.name,
            duration = request.duration,
            price = request.price,
            noShowPrice = request.noShowPrice
        )
        return meetingSourceRepository.save(source).toResponse()
    }
    
    fun updateSource(id: Long, request: UpdateMeetingSourceRequest): MeetingSourceResponse {
        val source = meetingSourceRepository.findById(id)
            .orElseThrow { RuntimeException("Meeting source not found with id: $id") }
        
        // Check if new name conflicts with existing sources
        if (request.name != null && request.name != source.name) {
            if (meetingSourceRepository.existsByName(request.name)) {
                throw RuntimeException("Source with name '${request.name}' already exists")
            }
        }
        
        val updated = source.copy(
            name = request.name ?: source.name,
            duration = request.duration ?: source.duration,
            price = request.price ?: source.price,
            noShowPrice = request.noShowPrice ?: source.noShowPrice,
            isActive = request.isActive ?: source.isActive,
            updatedAt = LocalDateTime.now()
        )
        return meetingSourceRepository.save(updated).toResponse()
    }
    
    fun deleteSource(id: Long) {
        val source = meetingSourceRepository.findById(id)
            .orElseThrow { RuntimeException("Meeting source not found with id: $id") }
        
        // Check if source is used in meetings
        if (meetingRepository.existsBySourceId(id)) {
            throw RuntimeException("Cannot delete source that is used in meetings")
        }
        
        meetingSourceRepository.deleteById(id)
    }
    
    fun toggleSourceActive(id: Long): MeetingSourceResponse {
        val source = meetingSourceRepository.findById(id)
            .orElseThrow { RuntimeException("Meeting source not found with id: $id") }
        
        val updated = source.copy(
            isActive = !source.isActive,
            updatedAt = LocalDateTime.now()
        )
        return meetingSourceRepository.save(updated).toResponse()
    }
    
    private fun MeetingSource.toResponse(): MeetingSourceResponse {
        return MeetingSourceResponse(
            id = this.id,
            name = this.name,
            duration = this.duration,
            price = this.price,
            noShowPrice = this.noShowPrice,
            isActive = this.isActive,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
} 