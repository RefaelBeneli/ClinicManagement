package com.clinic.security

import com.clinic.entity.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder

class SecurityUtilsTest {

    private lateinit var securityUtils: SecurityUtils

    @BeforeEach
    fun setUp() {
        securityUtils = SecurityUtils()
    }

    @Test
    fun `getCurrentUserId should return user ID when principal is User entity`() {
        // Given
        val userId = 1L
        val user = createUser(userId, Role.USER)
        val authentication = UsernamePasswordAuthenticationToken(user, null, user.authorities)
        SecurityContextHolder.getContext().authentication = authentication

        // When
        val result = securityUtils.getCurrentUserId()

        // Then
        assert(result == userId)
    }

    @Test
    fun `getCurrentUserId should return null when principal is not User or UserDetails`() {
        // Given
        val authentication = UsernamePasswordAuthenticationToken("string", null, emptyList())
        SecurityContextHolder.getContext().authentication = authentication

        // When
        val result = securityUtils.getCurrentUserId()

        // Then
        assert(result == null)
    }

    @Test
    fun `getCurrentUserId should return null when authentication is null`() {
        // Given
        SecurityContextHolder.getContext().authentication = null

        // When
        val result = securityUtils.getCurrentUserId()

        // Then
        assert(result == null)
    }

    @Test
    fun `getCurrentUser should return User when principal is User entity`() {
        // Given
        val user = createUser(1L, Role.USER)
        val authentication = UsernamePasswordAuthenticationToken(user, null, user.authorities)
        SecurityContextHolder.getContext().authentication = authentication

        // When
        val result = securityUtils.getCurrentUser()

        // Then
        assert(result == user)
    }

    @Test
    fun `getCurrentUser should return null when principal is not User or UserDetails`() {
        // Given
        val authentication = UsernamePasswordAuthenticationToken("string", null, emptyList())
        SecurityContextHolder.getContext().authentication = authentication

        // When
        val result = securityUtils.getCurrentUser()

        // Then
        assert(result == null)
    }

    @Test
    fun `getCurrentUser should return null when authentication is null`() {
        // Given
        SecurityContextHolder.getContext().authentication = null

        // When
        val result = securityUtils.getCurrentUser()

        // Then
        assert(result == null)
    }

    @Test
    fun `isCurrentUserAdmin should return true when user is admin`() {
        // Given
        val user = createUser(1L, Role.ADMIN)
        val authentication = UsernamePasswordAuthenticationToken(user, null, user.authorities)
        SecurityContextHolder.getContext().authentication = authentication

        // When
        val result = securityUtils.isCurrentUserAdmin()

        // Then
        assert(result == true)
    }

    @Test
    fun `isCurrentUserAdmin should return false when user is not admin`() {
        // Given
        val user = createUser(1L, Role.USER)
        val authentication = UsernamePasswordAuthenticationToken(user, null, user.authorities)
        SecurityContextHolder.getContext().authentication = authentication

        // When
        val result = securityUtils.isCurrentUserAdmin()

        // Then
        assert(result == false)
    }

    @Test
    fun `isCurrentUserAdmin should return false when no current user`() {
        // Given
        SecurityContextHolder.getContext().authentication = null

        // When
        val result = securityUtils.isCurrentUserAdmin()

        // Then
        assert(result == false)
    }

    @Test
    fun `extractUserIdFromJwt should return null when JWT is null`() {
        // Given
        val jwt: String? = null

        // When
        val result = securityUtils.extractUserIdFromJwt(jwt)

        // Then
        assert(result == null)
    }

    // Helper method to create test users
    private fun createUser(id: Long, role: Role): User {
        return User(
            id = id,
            username = "testuser",
            email = "test@example.com",
            fullName = "Test User",
            password = "password",
            role = role,
            enabled = true,
            approvalStatus = UserApprovalStatus.APPROVED
        )
    }
} 