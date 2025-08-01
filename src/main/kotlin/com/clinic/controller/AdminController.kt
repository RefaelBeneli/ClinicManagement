package com.clinic.controller

import com.clinic.dto.*
import com.clinic.service.AdminService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(
    private val adminService: AdminService
) {

    // User Management Endpoints
    @GetMapping("/users")
    fun getAllUsers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Page<AdminUserResponse>> {
        val pageable: Pageable = PageRequest.of(page, size)
        return ResponseEntity.ok(adminService.getAllUsers(pageable))
    }

    @GetMapping("/users/{id}")
    fun getUserById(@PathVariable id: Long): ResponseEntity<AdminUserResponse> {
        return ResponseEntity.ok(adminService.getUserById(id))
    }

    @PutMapping("/users/{id}")
    fun updateUser(
        @PathVariable id: Long,
        @RequestBody request: UpdateUserRequest
    ): ResponseEntity<AdminUserResponse> {
        return ResponseEntity.ok(adminService.updateUser(id, request))
    }

    @DeleteMapping("/users/{id}")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        adminService.deleteUser(id)
        return ResponseEntity.ok(MessageResponse("User deleted successfully"))
    }

    // Client Management Endpoints
    @GetMapping("/clients")
    fun getAllClients(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Page<AdminClientResponse>> {
        val pageable: Pageable = PageRequest.of(page, size)
        return ResponseEntity.ok(adminService.getAllClients(pageable))
    }

    @GetMapping("/clients/{id}")
    fun getClientById(@PathVariable id: Long): ResponseEntity<AdminClientResponse> {
        return ResponseEntity.ok(adminService.getClientById(id))
    }

    @PostMapping("/clients")
    fun createClient(@RequestBody request: AdminClientRequest): ResponseEntity<AdminClientResponse> {
        return ResponseEntity.ok(adminService.createClient(request))
    }

    @PutMapping("/clients/{id}")
    fun updateClient(
        @PathVariable id: Long,
        @RequestBody request: AdminClientRequest
    ): ResponseEntity<AdminClientResponse> {
        return ResponseEntity.ok(adminService.updateClient(id, request))
    }

    @DeleteMapping("/clients/{id}")
    fun deleteClient(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        adminService.deleteClient(id)
        return ResponseEntity.ok(MessageResponse("Client deleted successfully"))
    }

    // Meeting Management Endpoints
    @GetMapping("/meetings")
    fun getAllMeetings(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Page<AdminMeetingResponse>> {
        val pageable: Pageable = PageRequest.of(page, size)
        return ResponseEntity.ok(adminService.getAllMeetings(pageable))
    }

    @GetMapping("/meetings/{id}")
    fun getMeetingById(@PathVariable id: Long): ResponseEntity<AdminMeetingResponse> {
        return ResponseEntity.ok(adminService.getMeetingById(id))
    }

    @PostMapping("/meetings")
    fun createMeeting(@RequestBody request: AdminMeetingRequest): ResponseEntity<AdminMeetingResponse> {
        return ResponseEntity.ok(adminService.createMeeting(request))
    }

    @PutMapping("/meetings/{id}")
    fun updateMeeting(
        @PathVariable id: Long,
        @RequestBody request: AdminMeetingRequest
    ): ResponseEntity<AdminMeetingResponse> {
        return ResponseEntity.ok(adminService.updateMeeting(id, request))
    }

    @DeleteMapping("/meetings/{id}")
    fun deleteMeeting(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        adminService.deleteMeeting(id)
        return ResponseEntity.ok(MessageResponse("Meeting deleted successfully"))
    }

    // Personal Meeting Management Endpoints
    @GetMapping("/personal-meetings")
    fun getAllPersonalMeetings(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<Page<AdminPersonalMeetingResponse>> {
        val pageable: Pageable = PageRequest.of(page, size)
        return ResponseEntity.ok(adminService.getAllPersonalMeetings(pageable))
    }

    @GetMapping("/personal-meetings/{id}")
    fun getPersonalMeetingById(@PathVariable id: Long): ResponseEntity<AdminPersonalMeetingResponse> {
        return ResponseEntity.ok(adminService.getPersonalMeetingById(id))
    }

    @PostMapping("/personal-meetings")
    fun createPersonalMeeting(@RequestBody request: AdminPersonalMeetingRequest): ResponseEntity<AdminPersonalMeetingResponse> {
        return ResponseEntity.ok(adminService.createPersonalMeeting(request))
    }

    @PutMapping("/personal-meetings/{id}")
    fun updatePersonalMeeting(
        @PathVariable id: Long,
        @RequestBody request: AdminPersonalMeetingRequest
    ): ResponseEntity<AdminPersonalMeetingResponse> {
        return ResponseEntity.ok(adminService.updatePersonalMeeting(id, request))
    }

    @DeleteMapping("/personal-meetings/{id}")
    fun deletePersonalMeeting(@PathVariable id: Long): ResponseEntity<MessageResponse> {
        adminService.deletePersonalMeeting(id)
        return ResponseEntity.ok(MessageResponse("Personal meeting deleted successfully"))
    }

    // Dashboard Statistics
    @GetMapping("/dashboard/stats")
    fun getDashboardStats(): ResponseEntity<Map<String, Any>> {
        val stats = mapOf(
            "totalUsers" to adminService.getAllUsers(PageRequest.of(0, 1)).totalElements,
            "totalClients" to adminService.getAllClients(PageRequest.of(0, 1)).totalElements,
            "totalMeetings" to adminService.getAllMeetings(PageRequest.of(0, 1)).totalElements,
            "totalPersonalMeetings" to adminService.getAllPersonalMeetings(PageRequest.of(0, 1)).totalElements
        )
        return ResponseEntity.ok(stats)
    }
} 