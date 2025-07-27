package com.clinic.controller

import com.clinic.dto.*
import com.clinic.service.PersonalMeetingService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/personal-meetings")
class PersonalMeetingController {

    @Autowired
    private lateinit var personalMeetingService: PersonalMeetingService

    @GetMapping
    fun getAllPersonalMeetings(): ResponseEntity<List<PersonalMeetingResponse>> {
        return try {
            val meetings = personalMeetingService.getAllPersonalMeetings()
            ResponseEntity.ok(meetings)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/{id}")
    fun getPersonalMeetingById(@PathVariable id: Long): ResponseEntity<PersonalMeetingResponse> {
        return try {
            val meeting = personalMeetingService.getPersonalMeetingById(id)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping
    fun createPersonalMeeting(@Valid @RequestBody meetingRequest: PersonalMeetingRequest): ResponseEntity<PersonalMeetingResponse> {
        return try {
            val meeting = personalMeetingService.createPersonalMeeting(meetingRequest)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    fun updatePersonalMeeting(
        @PathVariable id: Long,
        @Valid @RequestBody updateRequest: UpdatePersonalMeetingRequest
    ): ResponseEntity<PersonalMeetingResponse> {
        return try {
            val meeting = personalMeetingService.updatePersonalMeeting(id, updateRequest)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PatchMapping("/{id}/payment")
    fun updatePaymentStatus(
        @PathVariable id: Long,
        @Valid @RequestBody paymentUpdate: PersonalMeetingPaymentUpdateRequest
    ): ResponseEntity<PersonalMeetingResponse> {
        return try {
            val meeting = personalMeetingService.updatePaymentStatus(id, paymentUpdate.isPaid)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    fun deletePersonalMeeting(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        return try {
            personalMeetingService.deletePersonalMeeting(id)
            ResponseEntity.ok(MessageResponse("Personal meeting deleted successfully"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error deleting personal meeting: ${e.message}"))
        }
    }

    @GetMapping("/stats")
    fun getPersonalMeetingStats(): ResponseEntity<*> {
        return try {
            val stats = personalMeetingService.getPersonalMeetingStats()
            ResponseEntity.ok(stats)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting personal meeting stats: ${e.message}"))
        }
    }

    @GetMapping("/month")
    fun getPersonalMeetingsByMonth(
        @RequestParam year: Int,
        @RequestParam month: Int
    ): ResponseEntity<List<PersonalMeetingResponse>> {
        return try {
            val meetings = personalMeetingService.getPersonalMeetingsByMonth(year, month)
            ResponseEntity.ok(meetings)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }
} 