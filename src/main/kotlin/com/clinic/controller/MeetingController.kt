package com.clinic.controller

import com.clinic.dto.*
import com.clinic.service.MeetingService
import com.clinic.service.MeetingSourceService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/meetings")
class MeetingController {

    @Autowired
    private lateinit var meetingService: MeetingService

    @Autowired
    private lateinit var meetingSourceService: MeetingSourceService

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

    @PutMapping("/{id}/payment")
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
    fun deleteMeeting(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            meetingService.deleteMeeting(id)
            ResponseEntity.ok(MessageResponse("Meeting disabled successfully"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error disabling meeting: ${e.message}"))
        }
    }

    @PatchMapping("/{id}/disable")
    fun disableMeeting(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            meetingService.deleteMeeting(id) // This now does soft delete
            ResponseEntity.ok(MessageResponse("Meeting disabled successfully"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error disabling meeting: ${e.message}"))
        }
    }

    @GetMapping("/revenue")
    fun getRevenueStats(
        @RequestParam period: String,
        @RequestParam(required = false) startDate: String? = null,
        @RequestParam(required = false) endDate: String? = null
    ): ResponseEntity<*> {
        return try {
            val start = startDate?.let { LocalDateTime.parse(it) }
            val end = endDate?.let { LocalDateTime.parse(it) }
            val stats = meetingService.getRevenueStats(period, start, end)
            ResponseEntity.ok(stats)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting revenue stats: ${e.message}"))
        }
    }

    @GetMapping("/user-dashboard-stats")
    fun getDashboardStats(): ResponseEntity<*> {
        return try {
            val stats = meetingService.getDashboardStats()
            ResponseEntity.ok(stats)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting dashboard stats: ${e.message}"))
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

    @PostMapping("/{id}/activate")
    fun activateMeeting(@PathVariable id: Long): ResponseEntity<MeetingResponse> {
        return try {
            val meeting = meetingService.activateMeeting(id)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/deactivate")
    fun deactivateMeeting(@PathVariable id: Long): ResponseEntity<MeetingResponse> {
        return try {
            val meeting = meetingService.deactivateMeeting(id)
            ResponseEntity.ok(meeting)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/sources")
    fun getActiveSources(): ResponseEntity<List<MeetingSourceResponse>> {
        return try {
            val sources = meetingSourceService.getActiveSources()
            ResponseEntity.ok(sources)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }
} 