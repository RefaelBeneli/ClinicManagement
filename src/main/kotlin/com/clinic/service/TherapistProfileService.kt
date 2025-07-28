package com.clinic.service

import com.clinic.dto.*
import com.clinic.entity.TherapistProfile
import com.clinic.repository.TherapistProfileRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class TherapistProfileService {

    @Autowired
    private lateinit var therapistProfileRepository: TherapistProfileRepository

    @Autowired
    private lateinit var authService: AuthService

    fun createOrUpdateProfile(profileRequest: TherapistProfileRequest): TherapistProfileResponse {
        val currentUser = authService.getCurrentUser()
        
        val existingProfile = therapistProfileRepository.findByUser(currentUser)
        
        val profile = if (existingProfile.isPresent) {
            // Update existing profile
            val existing = existingProfile.get()
            existing.copy(
                specialization = profileRequest.specialization,
                defaultRate = profileRequest.defaultRate,
                defaultSessionDuration = profileRequest.defaultSessionDuration,
                availableHours = profileRequest.availableHours,
                bio = profileRequest.bio,
                licenseNumber = profileRequest.licenseNumber,
                yearsExperience = profileRequest.yearsExperience,
                education = profileRequest.education,
                certifications = profileRequest.certifications,
                languages = profileRequest.languages,
                isAcceptingNewClients = profileRequest.isAcceptingNewClients,
                profileImageUrl = profileRequest.profileImageUrl,
                phoneNumber = profileRequest.phoneNumber,
                officeLocation = profileRequest.officeLocation,
                updatedAt = LocalDateTime.now()
            )
        } else {
            // Create new profile
            TherapistProfile(
                user = currentUser,
                specialization = profileRequest.specialization,
                defaultRate = profileRequest.defaultRate,
                defaultSessionDuration = profileRequest.defaultSessionDuration,
                availableHours = profileRequest.availableHours,
                bio = profileRequest.bio,
                licenseNumber = profileRequest.licenseNumber,
                yearsExperience = profileRequest.yearsExperience,
                education = profileRequest.education,
                certifications = profileRequest.certifications,
                languages = profileRequest.languages,
                isAcceptingNewClients = profileRequest.isAcceptingNewClients,
                profileImageUrl = profileRequest.profileImageUrl,
                phoneNumber = profileRequest.phoneNumber,
                officeLocation = profileRequest.officeLocation
            )
        }

        val savedProfile = therapistProfileRepository.save(profile)
        return mapToResponse(savedProfile)
    }

    fun getMyProfile(): TherapistProfileResponse? {
        val currentUser = authService.getCurrentUser()
        val profile = therapistProfileRepository.findByUser(currentUser)
        
        return if (profile.isPresent) {
            mapToResponse(profile.get())
        } else {
            null
        }
    }

    fun getProfileById(id: Long): TherapistProfileResponse? {
        val profile = therapistProfileRepository.findById(id)
        return if (profile.isPresent) {
            mapToResponse(profile.get())
        } else {
            null
        }
    }

    fun getProfileByUserId(userId: Long): TherapistProfileResponse? {
        val profile = therapistProfileRepository.findByUserId(userId)
        return if (profile.isPresent) {
            mapToResponse(profile.get())
        } else {
            null
        }
    }

    fun updateProfile(updateRequest: UpdateTherapistProfileRequest): TherapistProfileResponse {
        val currentUser = authService.getCurrentUser()
        val existingProfile = therapistProfileRepository.findByUser(currentUser)
            .orElseThrow { RuntimeException("Therapist profile not found") }

        val updatedProfile = existingProfile.copy(
            specialization = updateRequest.specialization ?: existingProfile.specialization,
            defaultRate = updateRequest.defaultRate ?: existingProfile.defaultRate,
            defaultSessionDuration = updateRequest.defaultSessionDuration ?: existingProfile.defaultSessionDuration,
            availableHours = updateRequest.availableHours ?: existingProfile.availableHours,
            bio = updateRequest.bio ?: existingProfile.bio,
            licenseNumber = updateRequest.licenseNumber ?: existingProfile.licenseNumber,
            yearsExperience = updateRequest.yearsExperience ?: existingProfile.yearsExperience,
            education = updateRequest.education ?: existingProfile.education,
            certifications = updateRequest.certifications ?: existingProfile.certifications,
            languages = updateRequest.languages ?: existingProfile.languages,
            isAcceptingNewClients = updateRequest.isAcceptingNewClients ?: existingProfile.isAcceptingNewClients,
            profileImageUrl = updateRequest.profileImageUrl ?: existingProfile.profileImageUrl,
            phoneNumber = updateRequest.phoneNumber ?: existingProfile.phoneNumber,
            officeLocation = updateRequest.officeLocation ?: existingProfile.officeLocation,
            updatedAt = LocalDateTime.now()
        )

        val savedProfile = therapistProfileRepository.save(updatedProfile)
        return mapToResponse(savedProfile)
    }

    fun getTherapistDirectory(): List<TherapistDirectoryResponse> {
        return therapistProfileRepository.findAllTherapistProfiles()
            .map { profile ->
                TherapistDirectoryResponse(
                    id = profile.id,
                    userId = profile.user.id,
                    fullName = profile.user.fullName,
                    email = profile.user.email,
                    specialization = profile.specialization,
                    yearsExperience = profile.yearsExperience,
                    languages = profile.languages,
                    isAcceptingNewClients = profile.isAcceptingNewClients,
                    bio = profile.bio
                )
            }
    }

    fun getAvailableTherapists(): List<TherapistDirectoryResponse> {
        return therapistProfileRepository.findByIsAcceptingNewClientsTrue()
            .map { profile ->
                TherapistDirectoryResponse(
                    id = profile.id,
                    userId = profile.user.id,
                    fullName = profile.user.fullName,
                    email = profile.user.email,
                    specialization = profile.specialization,
                    yearsExperience = profile.yearsExperience,
                    languages = profile.languages,
                    isAcceptingNewClients = profile.isAcceptingNewClients,
                    bio = profile.bio
                )
            }
    }

    fun searchTherapists(specialization: String?, language: String?): List<TherapistDirectoryResponse> {
        val profiles = when {
            !specialization.isNullOrBlank() && !language.isNullOrBlank() -> {
                // Search by both specialization and language
                therapistProfileRepository.findBySpecializationContainingIgnoreCase(specialization)
                    .filter { it.languages?.contains(language, ignoreCase = true) == true }
            }
            !specialization.isNullOrBlank() -> {
                therapistProfileRepository.findBySpecializationContainingIgnoreCase(specialization)
            }
            !language.isNullOrBlank() -> {
                therapistProfileRepository.findByLanguageContaining(language)
            }
            else -> {
                therapistProfileRepository.findAllTherapistProfiles()
            }
        }

        return profiles.map { profile ->
            TherapistDirectoryResponse(
                id = profile.id,
                userId = profile.user.id,
                fullName = profile.user.fullName,
                email = profile.user.email,
                specialization = profile.specialization,
                yearsExperience = profile.yearsExperience,
                languages = profile.languages,
                isAcceptingNewClients = profile.isAcceptingNewClients,
                bio = profile.bio
            )
        }
    }

    private fun mapToResponse(profile: TherapistProfile): TherapistProfileResponse {
        return TherapistProfileResponse(
            id = profile.id,
            userId = profile.user.id,
            userFullName = profile.user.fullName,
            userEmail = profile.user.email,
            specialization = profile.specialization,
            defaultRate = profile.defaultRate,
            defaultSessionDuration = profile.defaultSessionDuration,
            availableHours = profile.availableHours,
            bio = profile.bio,
            licenseNumber = profile.licenseNumber,
            yearsExperience = profile.yearsExperience,
            education = profile.education,
            certifications = profile.certifications,
            languages = profile.languages,
            isAcceptingNewClients = profile.isAcceptingNewClients,
            profileImageUrl = profile.profileImageUrl,
            phoneNumber = profile.phoneNumber,
            officeLocation = profile.officeLocation,
            createdAt = profile.createdAt,
            updatedAt = profile.updatedAt
        )
    }
} 