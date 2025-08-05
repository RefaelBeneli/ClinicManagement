package com.clinic.security

import com.clinic.entity.*
import com.clinic.repository.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

class ResourceOwnershipValidatorTest {

    @Mock
    private lateinit var meetingRepository: MeetingRepository

    @Mock
    private lateinit var clientRepository: ClientRepository

    @Mock
    private lateinit var expenseRepository: ExpenseRepository

    @Mock
    private lateinit var personalMeetingRepository: PersonalMeetingRepository

    private lateinit var resourceOwnershipValidator: ResourceOwnershipValidator

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        resourceOwnershipValidator = ResourceOwnershipValidator()
        // Use reflection to set private fields for testing
        val meetingRepoField = ResourceOwnershipValidator::class.java.getDeclaredField("meetingRepository")
        meetingRepoField.isAccessible = true
        meetingRepoField.set(resourceOwnershipValidator, meetingRepository)
        
        val clientRepoField = ResourceOwnershipValidator::class.java.getDeclaredField("clientRepository")
        clientRepoField.isAccessible = true
        clientRepoField.set(resourceOwnershipValidator, clientRepository)
        
        val expenseRepoField = ResourceOwnershipValidator::class.java.getDeclaredField("expenseRepository")
        expenseRepoField.isAccessible = true
        expenseRepoField.set(resourceOwnershipValidator, expenseRepository)
        
        val personalMeetingRepoField = ResourceOwnershipValidator::class.java.getDeclaredField("personalMeetingRepository")
        personalMeetingRepoField.isAccessible = true
        personalMeetingRepoField.set(resourceOwnershipValidator, personalMeetingRepository)
    }

    @Test
    fun `validateMeetingOwnership should return true when user owns the meeting`() {
        // Given
        val userId = 1L
        val meetingId = 1L
        val user = createUser(userId, Role.USER)
        val meeting = createMeeting(meetingId, user)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, userId)

        // Then
        assert(result)
        verify(meetingRepository).findById(meetingId)
    }

    @Test
    fun `validateMeetingOwnership should return true when admin owns the meeting`() {
        // Given
        val adminId = 2L
        val meetingId = 1L
        val admin = createUser(adminId, Role.ADMIN)
        val meeting = createMeeting(meetingId, admin)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, adminId)

        // Then
        assert(result)
        verify(meetingRepository).findById(meetingId)
    }

    @Test
    fun `validateMeetingOwnership should return false when user does not own the meeting`() {
        // Given
        val userId = 1L
        val meetingId = 1L
        val otherUser = createUser(3L, Role.USER)
        val meeting = createMeeting(meetingId, otherUser)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, userId)

        // Then
        assert(!result)
        verify(meetingRepository).findById(meetingId)
    }

    @Test
    fun `validateMeetingOwnership should return false when meeting does not exist`() {
        // Given
        val userId = 1L
        val meetingId = 999L
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.empty())

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, userId)

        // Then
        assert(!result)
        verify(meetingRepository).findById(meetingId)
    }

    @Test
    fun `validateClientOwnership should return true when user owns the client`() {
        // Given
        val userId = 1L
        val clientId = 1L
        val user = createUser(userId, Role.USER)
        val client = createClient(clientId, user)
        
        `when`(clientRepository.findById(clientId)).thenReturn(java.util.Optional.of(client))

        // When
        val result = resourceOwnershipValidator.validateClientOwnership(clientId, userId)

        // Then
        assert(result)
        verify(clientRepository).findById(clientId)
    }

    @Test
    fun `validateClientOwnership should return true when admin owns the client`() {
        // Given
        val adminId = 2L
        val clientId = 1L
        val admin = createUser(adminId, Role.ADMIN)
        val client = createClient(clientId, admin)
        
        `when`(clientRepository.findById(clientId)).thenReturn(java.util.Optional.of(client))

        // When
        val result = resourceOwnershipValidator.validateClientOwnership(clientId, adminId)

        // Then
        assert(result)
        verify(clientRepository).findById(clientId)
    }

    @Test
    fun `validateClientOwnership should return false when user does not own the client`() {
        // Given
        val userId = 1L
        val clientId = 1L
        val otherUser = createUser(3L, Role.USER)
        val client = createClient(clientId, otherUser)
        
        `when`(clientRepository.findById(clientId)).thenReturn(java.util.Optional.of(client))

        // When
        val result = resourceOwnershipValidator.validateClientOwnership(clientId, userId)

        // Then
        assert(!result)
        verify(clientRepository).findById(clientId)
    }

    @Test
    fun `validateExpenseOwnership should return true when user owns the expense`() {
        // Given
        val userId = 1L
        val expenseId = 1L
        val user = createUser(userId, Role.USER)
        val expense = createExpense(expenseId, user)
        
        `when`(expenseRepository.findById(expenseId)).thenReturn(java.util.Optional.of(expense))

        // When
        val result = resourceOwnershipValidator.validateExpenseOwnership(expenseId, userId)

        // Then
        assert(result)
        verify(expenseRepository).findById(expenseId)
    }

    @Test
    fun `validateExpenseOwnership should return true when admin owns the expense`() {
        // Given
        val adminId = 2L
        val expenseId = 1L
        val admin = createUser(adminId, Role.ADMIN)
        val expense = createExpense(expenseId, admin)
        
        `when`(expenseRepository.findById(expenseId)).thenReturn(java.util.Optional.of(expense))

        // When
        val result = resourceOwnershipValidator.validateExpenseOwnership(expenseId, adminId)

        // Then
        assert(result)
        verify(expenseRepository).findById(expenseId)
    }

    @Test
    fun `validateExpenseOwnership should return false when user does not own the expense`() {
        // Given
        val userId = 1L
        val expenseId = 1L
        val otherUser = createUser(3L, Role.USER)
        val expense = createExpense(expenseId, otherUser)
        
        `when`(expenseRepository.findById(expenseId)).thenReturn(java.util.Optional.of(expense))

        // When
        val result = resourceOwnershipValidator.validateExpenseOwnership(expenseId, userId)

        // Then
        assert(!result)
        verify(expenseRepository).findById(expenseId)
    }

    @Test
    fun `validatePersonalMeetingOwnership should return true when user owns the personal meeting`() {
        // Given
        val userId = 1L
        val personalMeetingId = 1L
        val user = createUser(userId, Role.USER)
        val personalMeeting = createPersonalMeeting(personalMeetingId, user)
        
        `when`(personalMeetingRepository.findById(personalMeetingId)).thenReturn(java.util.Optional.of(personalMeeting))

        // When
        val result = resourceOwnershipValidator.validatePersonalMeetingOwnership(personalMeetingId, userId)

        // Then
        assert(result)
        verify(personalMeetingRepository).findById(personalMeetingId)
    }

    @Test
    fun `validatePersonalMeetingOwnership should return true when admin owns the personal meeting`() {
        // Given
        val adminId = 2L
        val personalMeetingId = 1L
        val admin = createUser(adminId, Role.ADMIN)
        val personalMeeting = createPersonalMeeting(personalMeetingId, admin)
        
        `when`(personalMeetingRepository.findById(personalMeetingId)).thenReturn(java.util.Optional.of(personalMeeting))

        // When
        val result = resourceOwnershipValidator.validatePersonalMeetingOwnership(personalMeetingId, adminId)

        // Then
        assert(result)
        verify(personalMeetingRepository).findById(personalMeetingId)
    }

    @Test
    fun `validatePersonalMeetingOwnership should return false when user does not own the personal meeting`() {
        // Given
        val userId = 1L
        val personalMeetingId = 1L
        val otherUser = createUser(3L, Role.USER)
        val personalMeeting = createPersonalMeeting(personalMeetingId, otherUser)
        
        `when`(personalMeetingRepository.findById(personalMeetingId)).thenReturn(java.util.Optional.of(personalMeeting))

        // When
        val result = resourceOwnershipValidator.validatePersonalMeetingOwnership(personalMeetingId, userId)

        // Then
        assert(!result)
        verify(personalMeetingRepository).findById(personalMeetingId)
    }

    @Test
    fun `validateResourceAccess should handle meeting resources correctly`() {
        // Given
        val userId = 1L
        val meetingId = 1L
        val user = createUser(userId, Role.USER)
        val meeting = createMeeting(meetingId, user)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateResourceAccess("meeting", meetingId, userId)

        // Then
        assert(result)
        verify(meetingRepository).findById(meetingId)
    }

    @Test
    fun `validateResourceAccess should handle client resources correctly`() {
        // Given
        val userId = 1L
        val clientId = 1L
        val user = createUser(userId, Role.USER)
        val client = createClient(clientId, user)
        
        `when`(clientRepository.findById(clientId)).thenReturn(java.util.Optional.of(client))

        // When
        val result = resourceOwnershipValidator.validateResourceAccess("client", clientId, userId)

        // Then
        assert(result)
        verify(clientRepository).findById(clientId)
    }

    @Test
    fun `validateResourceAccess should handle expense resources correctly`() {
        // Given
        val userId = 1L
        val expenseId = 1L
        val user = createUser(userId, Role.USER)
        val expense = createExpense(expenseId, user)
        
        `when`(expenseRepository.findById(expenseId)).thenReturn(java.util.Optional.of(expense))

        // When
        val result = resourceOwnershipValidator.validateResourceAccess("expense", expenseId, userId)

        // Then
        assert(result)
        verify(expenseRepository).findById(expenseId)
    }

    @Test
    fun `validateResourceAccess should handle personal meeting resources correctly`() {
        // Given
        val userId = 1L
        val personalMeetingId = 1L
        val user = createUser(userId, Role.USER)
        val personalMeeting = createPersonalMeeting(personalMeetingId, user)
        
        `when`(personalMeetingRepository.findById(personalMeetingId)).thenReturn(java.util.Optional.of(personalMeeting))

        // When
        val result = resourceOwnershipValidator.validateResourceAccess("personalmeeting", personalMeetingId, userId)

        // Then
        assert(result)
        verify(personalMeetingRepository).findById(personalMeetingId)
    }

    @Test
    fun `validateResourceAccess should return false for unknown resource types`() {
        // Given
        val userId = 1L
        val resourceId = 1L

        // When
        val result = resourceOwnershipValidator.validateResourceAccess("unknown", resourceId, userId)

        // Then
        assert(!result)
    }

    @Test
    fun `validateResourceAccess should handle case insensitive resource types`() {
        // Given
        val userId = 1L
        val meetingId = 1L
        val user = createUser(userId, Role.USER)
        val meeting = createMeeting(meetingId, user)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateResourceAccess("MEETING", meetingId, userId)

        // Then
        assert(result)
        verify(meetingRepository).findById(meetingId)
    }

    // Edge cases
    @Test
    fun `validateMeetingOwnership should handle negative user ID`() {
        // Given
        val userId = -1L
        val meetingId = 1L
        val user = createUser(1L, Role.USER)
        val meeting = createMeeting(meetingId, user)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, userId)

        // Then
        assert(!result)
    }

    @Test
    fun `validateMeetingOwnership should handle zero user ID`() {
        // Given
        val userId = 0L
        val meetingId = 1L
        val user = createUser(1L, Role.USER)
        val meeting = createMeeting(meetingId, user)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, userId)

        // Then
        assert(!result)
    }

    @Test
    fun `validateMeetingOwnership should handle non-existent meeting`() {
        // Given
        val userId = 1L
        val meetingId = 999L // Non-existent meeting ID
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.empty())

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, userId)

        // Then
        assert(!result)
    }

    // Helper methods
    private fun createUser(id: Long, role: Role): User {
        return User(
            id = id,
            username = "user$id",
            email = "user$id@example.com",
            fullName = "User $id",
            password = "password",
            role = role,
            enabled = true,
            approvalStatus = UserApprovalStatus.APPROVED
        )
    }

    private fun createMeeting(id: Long, user: User?): Meeting {
        return Meeting(
            id = id,
            client = createClient(1L, user),
            user = user ?: createUser(1L, Role.USER),
            meetingDate = LocalDateTime.now(),
            duration = 60,
            price = BigDecimal("100.00")
        )
    }

    private fun createClient(id: Long, user: User?): Client {
        return Client(
            id = id,
            fullName = "Client $id",
            email = "client$id@example.com",
            phone = "1234567890",
            user = user ?: createUser(1L, Role.USER),
            source = createClientSource(1L)
        )
    }

    private fun createClientSource(id: Long): ClientSource {
        return ClientSource(
            id = id,
            name = "Test Source",
            duration = 60,
            price = BigDecimal("100.00"),
            noShowPrice = BigDecimal("50.00"),
            isActive = true,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
    }

    private fun createExpense(id: Long, user: User?): Expense {
        return Expense(
            id = id,
            user = user ?: createUser(1L, Role.USER),
            name = "Expense $id",
            description = "Test expense",
            amount = BigDecimal("50.00"),
            category = "Test",
            expenseDate = LocalDate.now()
        )
    }

    private fun createPersonalMeeting(id: Long, user: User?): PersonalMeeting {
        return PersonalMeeting(
            id = id,
            user = user ?: createUser(1L, Role.USER),
            therapistName = "Therapist $id",
            meetingType = createPersonalMeetingType(1L),
            meetingDate = LocalDateTime.now(),
            duration = 60,
            price = BigDecimal("75.00"),
            notes = "Test personal meeting"
        )
    }

    private fun createPersonalMeetingType(id: Long): PersonalMeetingType {
        return PersonalMeetingType(
            id = id,
            name = "Test Meeting Type",
            duration = 60,
            price = BigDecimal("100.00"),
            isRecurring = false,
            recurrenceFrequency = null,
            isActive = true,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
    }
} 