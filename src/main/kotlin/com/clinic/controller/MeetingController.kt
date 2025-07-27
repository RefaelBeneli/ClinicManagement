package com.clinic.controller

import com.clinic.dto.*
import com.clinic.service.MeetingService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/meetings")
class MeetingController {

    @Autowired
    private lateinit var meetingService: MeetingService

    @GetMapping
    fun getAllMeetings(): ResponseEntity<List<MeetingResponse>> {
        return try {
            val meetings = meetingService.getAllMeetings()
            ResponseEntity.ok(meetings)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/{id}")
    fun getMeetingById(@PathVariable id: Long): ResponseEntity<MeetingResponse> {
        return try {
            val meeting = meetingService.getMeetingById(id)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping
    fun createMeeting(@Valid @RequestBody meetingRequest: MeetingRequest): ResponseEntity<MeetingResponse> {
        return try {
            val meeting = meetingService.createMeeting(meetingRequest)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    fun updateMeeting(
        @PathVariable id: Long,
        @Valid @RequestBody updateRequest: UpdateMeetingRequest
    ): ResponseEntity<MeetingResponse> {
        return try {
            val meeting = meetingService.updateMeeting(id, updateRequest)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PatchMapping("/{id}/payment")
    fun updatePaymentStatus(
        @PathVariable id: Long,
        @Valid @RequestBody paymentUpdate: PaymentUpdateRequest
    ): ResponseEntity<MeetingResponse> {
        return try {
            val meeting = meetingService.updatePaymentStatus(id, paymentUpdate.isPaid)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    fun deleteMeeting(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        return try {
            meetingService.deleteMeeting(id)
            ResponseEntity.ok(MessageResponse("Meeting deleted successfully"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Failed to delete meeting"))
        }
    }

    @GetMapping("/month")
    fun getMeetingsByMonth(
        @RequestParam year: Int,
        @RequestParam month: Int
    ): ResponseEntity<List<MeetingResponse>> {
        return try {
            val meetings = meetingService.getMeetingsByMonth(year, month)
            ResponseEntity.ok(meetings)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }
} 