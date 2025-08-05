package com.clinic.controller

import com.clinic.dto.PersonalMeetingTypeRequest
import com.clinic.dto.PersonalMeetingTypeResponse
import com.clinic.dto.UpdatePersonalMeetingTypeRequest
import com.clinic.service.PersonalMeetingTypeService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/admin/personal-meeting-types")
@PreAuthorize("hasRole('ADMIN')")
class PersonalMeetingTypeController(
    private val personalMeetingTypeService: PersonalMeetingTypeService
) {
    
    @GetMapping
    fun getAllPersonalMeetingTypes(): ResponseEntity<List<PersonalMeetingTypeResponse>> {
        val meetingTypes = personalMeetingTypeService.getAllPersonalMeetingTypes()
        return ResponseEntity.ok(meetingTypes)
    }
    
    @GetMapping("/active")
    fun getActivePersonalMeetingTypes(): ResponseEntity<List<PersonalMeetingTypeResponse>> {
        val meetingTypes = personalMeetingTypeService.getActivePersonalMeetingTypes()
        return ResponseEntity.ok(meetingTypes)
    }
    
    @GetMapping("/{id}")
    fun getPersonalMeetingTypeById(@PathVariable id: Long): ResponseEntity<PersonalMeetingTypeResponse> {
        val meetingType = personalMeetingTypeService.getPersonalMeetingTypeById(id)
        return ResponseEntity.ok(meetingType)
    }
    
    @PostMapping
    fun createPersonalMeetingType(@RequestBody request: PersonalMeetingTypeRequest): ResponseEntity<PersonalMeetingTypeResponse> {
        val meetingType = personalMeetingTypeService.createPersonalMeetingType(request)
        return ResponseEntity.ok(meetingType)
    }
    
    @PutMapping("/{id}")
    fun updatePersonalMeetingType(
        @PathVariable id: Long,
        @RequestBody request: UpdatePersonalMeetingTypeRequest
    ): ResponseEntity<PersonalMeetingTypeResponse> {
        val meetingType = personalMeetingTypeService.updatePersonalMeetingType(id, request)
        return ResponseEntity.ok(meetingType)
    }
    
    @DeleteMapping("/{id}")
    fun deletePersonalMeetingType(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        personalMeetingTypeService.deletePersonalMeetingType(id)
        return ResponseEntity.ok(mapOf("message" to "Personal meeting type deleted successfully"))
    }
    
    @PatchMapping("/{id}/toggle")
    fun togglePersonalMeetingTypeActive(@PathVariable id: Long): ResponseEntity<PersonalMeetingTypeResponse> {
        val meetingType = personalMeetingTypeService.togglePersonalMeetingTypeActive(id)
        return ResponseEntity.ok(meetingType)
    }
} 