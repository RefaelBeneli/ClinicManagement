package com.clinic.controller

import com.clinic.dto.*
import com.clinic.service.TherapistProfileService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/therapist-profiles")
class TherapistProfileController {

    @Autowired
    private lateinit var therapistProfileService: TherapistProfileService

    @GetMapping("/my-profile")
    fun getMyProfile(): ResponseEntity<*> {
        return try {
            val profile = therapistProfileService.getMyProfile()
            if (profile != null) {
                ResponseEntity.ok(profile)
            } else {
                ResponseEntity.ok(MessageResponse("No profile found. Create one to get started."))
            }
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting profile: ${e.message}"))
        }
    }

    @GetMapping("/{id}")
    fun getProfileById(@PathVariable id: Long): ResponseEntity<*> {
        return try {
            val profile = therapistProfileService.getProfileById(id)
            if (profile != null) {
                ResponseEntity.ok(profile)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting profile: ${e.message}"))
        }
    }

    @GetMapping("/user/{userId}")
    fun getProfileByUserId(@PathVariable userId: Long): ResponseEntity<*> {
        return try {
            val profile = therapistProfileService.getProfileByUserId(userId)
            if (profile != null) {
                ResponseEntity.ok(profile)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error getting profile: ${e.message}"))
        }
    }

    @PostMapping
    fun createOrUpdateProfile(@Valid @RequestBody profileRequest: TherapistProfileRequest): ResponseEntity<*> {
        return try {
            val profile = therapistProfileService.createOrUpdateProfile(profileRequest)
            ResponseEntity.ok(profile)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error creating/updating profile: ${e.message}"))
        }
    }

    @PatchMapping
    fun updateProfile(@Valid @RequestBody updateRequest: UpdateTherapistProfileRequest): ResponseEntity<*> {
        return try {
            val profile = therapistProfileService.updateProfile(updateRequest)
            ResponseEntity.ok(profile)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(MessageResponse("Error updating profile: ${e.message}"))
        }
    }

    @GetMapping("/directory")
    fun getTherapistDirectory(): ResponseEntity<List<TherapistDirectoryResponse>> {
        return try {
            val directory = therapistProfileService.getTherapistDirectory()
            ResponseEntity.ok(directory)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/available")
    fun getAvailableTherapists(): ResponseEntity<List<TherapistDirectoryResponse>> {
        return try {
            val therapists = therapistProfileService.getAvailableTherapists()
            ResponseEntity.ok(therapists)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @GetMapping("/search")
    fun searchTherapists(
        @RequestParam(required = false) specialization: String?,
        @RequestParam(required = false) language: String?
    ): ResponseEntity<List<TherapistDirectoryResponse>> {
        return try {
            val therapists = therapistProfileService.searchTherapists(specialization, language)
            ResponseEntity.ok(therapists)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }
} 