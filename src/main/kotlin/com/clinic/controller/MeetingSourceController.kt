package com.clinic.controller

import com.clinic.dto.MeetingSourceRequest
import com.clinic.dto.MeetingSourceResponse
import com.clinic.dto.UpdateMeetingSourceRequest
import com.clinic.service.MeetingSourceService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/admin/sources")
@PreAuthorize("hasRole('ADMIN')")
class MeetingSourceController(
    private val meetingSourceService: MeetingSourceService
) {
    
    @GetMapping
    fun getAllSources(): ResponseEntity<List<MeetingSourceResponse>> {
        val sources = meetingSourceService.getAllSources()
        return ResponseEntity.ok(sources)
    }
    
    @GetMapping("/active")
    fun getActiveSources(): ResponseEntity<List<MeetingSourceResponse>> {
        val sources = meetingSourceService.getActiveSources()
        return ResponseEntity.ok(sources)
    }
    
    @GetMapping("/{id}")
    fun getSourceById(@PathVariable id: Long): ResponseEntity<MeetingSourceResponse> {
        val source = meetingSourceService.getSourceById(id)
        return ResponseEntity.ok(source)
    }
    
    @PostMapping
    fun createSource(@RequestBody request: MeetingSourceRequest): ResponseEntity<MeetingSourceResponse> {
        val source = meetingSourceService.createSource(request)
        return ResponseEntity.ok(source)
    }
    
    @PutMapping("/{id}")
    fun updateSource(
        @PathVariable id: Long,
        @RequestBody request: UpdateMeetingSourceRequest
    ): ResponseEntity<MeetingSourceResponse> {
        val source = meetingSourceService.updateSource(id, request)
        return ResponseEntity.ok(source)
    }
    
    @DeleteMapping("/{id}")
    fun deleteSource(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        meetingSourceService.deleteSource(id)
        return ResponseEntity.ok(mapOf("message" to "Source deleted successfully"))
    }
    
    @PatchMapping("/{id}/toggle")
    fun toggleSourceActive(@PathVariable id: Long): ResponseEntity<MeetingSourceResponse> {
        val source = meetingSourceService.toggleSourceActive(id)
        return ResponseEntity.ok(source)
    }
} 