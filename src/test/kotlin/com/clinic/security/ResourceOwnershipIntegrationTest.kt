package com.clinic.security

import com.clinic.entity.*
import com.clinic.repository.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

class ResourceOwnershipIntegrationTest {

    private lateinit var resourceOwnershipValidator: ResourceOwnershipValidator
    private lateinit var meetingRepository: MeetingRepository
    private lateinit var clientRepository: ClientRepository
    private lateinit var expenseRepository: ExpenseRepository
    private lateinit var personalMeetingRepository: PersonalMeetingRepository

    @BeforeEach
    fun setUp() {
        meetingRepository = mock(MeetingRepository::class.java)
        clientRepository = mock(ClientRepository::class.java)
        expenseRepository = mock(ExpenseRepository::class.java)
        personalMeetingRepository = mock(PersonalMeetingRepository::class.java)
        
        resourceOwnershipValidator = ResourceOwnershipValidator()
        // Use reflection to inject mocks
        val meetingField = ResourceOwnershipValidator::class.java.getDeclaredField("meetingRepository")
        val clientField = ResourceOwnershipValidator::class.java.getDeclaredField("clientRepository")
        val expenseField = ResourceOwnershipValidator::class.java.getDeclaredField("expenseRepository")
        val personalMeetingField = ResourceOwnershipValidator::class.java.getDeclaredField("personalMeetingRepository")
        
        meetingField.isAccessible = true
        clientField.isAccessible = true
        expenseField.isAccessible = true
        personalMeetingField.isAccessible = true
        
        meetingField.set(resourceOwnershipValidator, meetingRepository)
        clientField.set(resourceOwnershipValidator, clientRepository)
        expenseField.set(resourceOwnershipValidator, expenseRepository)
        personalMeetingField.set(resourceOwnershipValidator, personalMeetingRepository)
    }

    @Test
    fun `user should be able to access their own meetings`() {
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
    }

    @Test
    fun `user should not be able to access other users meetings`() {
        // Given
        val userId = 1L
        val otherUserId = 2L
        val meetingId = 1L
        val otherUser = createUser(otherUserId, Role.USER)
        val meeting = createMeeting(meetingId, otherUser)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, userId)

        // Then
        assert(!result)
    }

    @Test
    fun `admin should be able to access any meeting`() {
        // Given
        val adminId = 1L
        val userId = 2L
        val meetingId = 1L
        val user = createUser(userId, Role.ADMIN)
        val meeting = createMeeting(meetingId, user)
        
        `when`(meetingRepository.findById(meetingId)).thenReturn(java.util.Optional.of(meeting))

        // When
        val result = resourceOwnershipValidator.validateMeetingOwnership(meetingId, adminId)

        // Then
        assert(result)
    }

    @Test
    fun `user should be able to access their own clients`() {
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
    }

    @Test
    fun `user should not be able to access other users clients`() {
        // Given
        val userId = 1L
        val otherUserId = 2L
        val clientId = 1L
        val otherUser = createUser(otherUserId, Role.USER)
        val client = createClient(clientId, otherUser)
        
        `when`(clientRepository.findById(clientId)).thenReturn(java.util.Optional.of(client))

        // When
        val result = resourceOwnershipValidator.validateClientOwnership(clientId, userId)

        // Then
        assert(!result)
    }

    @Test
    fun `user should be able to access their own expenses`() {
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
    }

    @Test
    fun `user should not be able to access other users expenses`() {
        // Given
        val userId = 1L
        val otherUserId = 2L
        val expenseId = 1L
        val otherUser = createUser(otherUserId, Role.USER)
        val expense = createExpense(expenseId, otherUser)
        
        `when`(expenseRepository.findById(expenseId)).thenReturn(java.util.Optional.of(expense))

        // When
        val result = resourceOwnershipValidator.validateExpenseOwnership(expenseId, userId)

        // Then
        assert(!result)
    }

    @Test
    fun `user should be able to access their own personal meetings`() {
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
    }

    @Test
    fun `user should not be able to access other users personal meetings`() {
        // Given
        val userId = 1L
        val otherUserId = 2L
        val personalMeetingId = 1L
        val otherUser = createUser(otherUserId, Role.USER)
        val personalMeeting = createPersonalMeeting(personalMeetingId, otherUser)
        
        `when`(personalMeetingRepository.findById(personalMeetingId)).thenReturn(java.util.Optional.of(personalMeeting))

        // When
        val result = resourceOwnershipValidator.validatePersonalMeetingOwnership(personalMeetingId, userId)

        // Then
        assert(!result)
    }

    @Test
    fun `resource access validation should handle unknown resource types`() {
        // Given
        val userId = 1L
        val resourceId = 1L
        val unknownResourceType = "unknown"

        // When
        val result = resourceOwnershipValidator.validateResourceAccess(unknownResourceType, resourceId, userId)

        // Then
        assert(!result)
    }

    @Test
    fun `resource access validation should handle meeting resource type`() {
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
    }

    @Test
    fun `resource access validation should handle client resource type`() {
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
    }

    @Test
    fun `resource access validation should handle expense resource type`() {
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
    }

    @Test
    fun `resource access validation should handle personal meeting resource type`() {
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

    private fun createMeeting(id: Long, user: User): Meeting {
        return Meeting(
            id = id,
            client = createClient(1L, user),
            user = user,
            meetingDate = LocalDateTime.now(),
            duration = 60,
            price = BigDecimal("100.00")
        )
    }

    private fun createClient(id: Long, user: User): Client {
        return Client(
            id = id,
            fullName = "Client $id",
            email = "client$id@example.com",
            phone = "1234567890",
            user = user,
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

    private fun createExpense(id: Long, user: User): Expense {
        return Expense(
            id = id,
            user = user,
            name = "Expense $id",
            description = "Test expense",
            amount = BigDecimal("50.00"),
            category = "Test",
            expenseDate = LocalDate.now()
        )
    }

    private fun createPersonalMeeting(id: Long, user: User): PersonalMeeting {
        return PersonalMeeting(
            id = id,
            user = user,
            therapistName = "Therapist $id",
            meetingType = createPersonalMeetingType(1L),
            meetingDate = LocalDateTime.now(),
            duration = 30,
            price = BigDecimal("75.00")
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