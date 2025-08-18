package com.clinic.controller

import com.clinic.dto.PersonalMeetingTypeResponse
import com.clinic.service.PersonalMeetingTypeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/personal-meeting-types")
class PublicPersonalMeetingTypeController(
    private val personalMeetingTypeService: PersonalMeetingTypeService
) {
    
    // Public endpoint for regular users to get active meeting types
    @GetMapping("/active")
    fun getActivePersonalMeetingTypes(): ResponseEntity<List<PersonalMeetingTypeResponse>> {
        val meetingTypes = personalMeetingTypeService.getActivePersonalMeetingTypes()
        return ResponseEntity.ok(meetingTypes)
    }
}
