package com.clinic.security

import com.clinic.entity.*
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

class ResourceOwnershipFilterTest {

    @Mock
    private lateinit var securityUtils: SecurityUtils

    @Mock
    private lateinit var resourceOwnershipValidator: ResourceOwnershipValidator

    @Mock
    private lateinit var request: HttpServletRequest

    @Mock
    private lateinit var response: HttpServletResponse

    @Mock
    private lateinit var filterChain: FilterChain

    private lateinit var resourceOwnershipFilter: ResourceOwnershipFilter

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        resourceOwnershipFilter = ResourceOwnershipFilter()
        // Use reflection to set private fields for testing
        val securityUtilsField = ResourceOwnershipFilter::class.java.getDeclaredField("securityUtils")
        securityUtilsField.isAccessible = true
        securityUtilsField.set(resourceOwnershipFilter, securityUtils)
        
        val resourceOwnershipValidatorField = ResourceOwnershipFilter::class.java.getDeclaredField("resourceOwnershipValidator")
        resourceOwnershipValidatorField.isAccessible = true
        resourceOwnershipValidatorField.set(resourceOwnershipFilter, resourceOwnershipValidator)
    }

    @Test
    fun `should allow access when user owns the meeting`() {
        // Given
        val userId = 1L
        val meetingId = 1L
        val requestURI = "/api/meetings/$meetingId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(userId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(false)
        `when`(resourceOwnershipValidator.validateResourceAccess("meeting", meetingId, userId)).thenReturn(true)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should deny access when user does not own the meeting`() {
        // Given
        val userId = 1L
        val meetingId = 1L
        val requestURI = "/api/meetings/$meetingId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(userId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(false)
        `when`(resourceOwnershipValidator.validateResourceAccess("meeting", meetingId, userId)).thenReturn(false)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(response).sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied: You don't own this resource")
        verify(filterChain, never()).doFilter(request, response)
    }

    @Test
    fun `should allow admin access to any meeting`() {
        // Given
        val adminId = 2L
        val meetingId = 1L
        val requestURI = "/api/meetings/$meetingId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(adminId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(true)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(response, never()).sendError(anyInt(), anyString())
        verify(resourceOwnershipValidator, never()).validateResourceAccess(anyString(), anyLong(), anyLong())
    }

    @Test
    fun `should deny access when user is not authenticated`() {
        // Given
        val meetingId = 1L
        val requestURI = "/api/meetings/$meetingId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(null)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not authenticated")
        verify(filterChain, never()).doFilter(request, response)
    }

    @Test
    fun `should allow access to client resource when user owns it`() {
        // Given
        val userId = 1L
        val clientId = 1L
        val requestURI = "/api/clients/$clientId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(userId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(false)
        `when`(resourceOwnershipValidator.validateResourceAccess("client", clientId, userId)).thenReturn(true)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should allow access to expense resource when user owns it`() {
        // Given
        val userId = 1L
        val expenseId = 1L
        val requestURI = "/api/expenses/$expenseId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(userId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(false)
        `when`(resourceOwnershipValidator.validateResourceAccess("expense", expenseId, userId)).thenReturn(true)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should allow access to personal meeting resource when user owns it`() {
        // Given
        val userId = 1L
        val personalMeetingId = 1L
        val requestURI = "/api/personal-meetings/$personalMeetingId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(userId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(false)
        `when`(resourceOwnershipValidator.validateResourceAccess("personalmeeting", personalMeetingId, userId)).thenReturn(true)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should skip validation for auth endpoints`() {
        // Given
        val requestURI = "/api/auth/login"
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should skip validation for admin endpoints`() {
        // Given
        val requestURI = "/api/admin/users"
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should skip validation for list endpoints`() {
        // Given
        val requestURI = "/api/meetings"
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should skip validation for endpoints with additional paths`() {
        // Given
        val requestURI = "/api/meetings/1/payment"
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should handle non-numeric resource IDs gracefully`() {
        // Given
        val requestURI = "/api/meetings/abc"
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should handle very large resource IDs`() {
        // Given
        val userId = 1L
        val meetingId = Long.MAX_VALUE
        val requestURI = "/api/meetings/$meetingId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(userId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(false)
        `when`(resourceOwnershipValidator.validateResourceAccess("meeting", meetingId, userId)).thenReturn(true)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should handle zero resource IDs`() {
        // Given
        val userId = 1L
        val meetingId = 0L
        val requestURI = "/api/meetings/$meetingId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(userId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(false)
        `when`(resourceOwnershipValidator.validateResourceAccess("meeting", meetingId, userId)).thenReturn(false)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(response).sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied: You don't own this resource")
        verify(filterChain, never()).doFilter(request, response)
    }

    @Test
    fun `should handle negative resource IDs`() {
        // Given
        val userId = 1L
        val meetingId = -1L
        val requestURI = "/api/meetings/$meetingId"
        
        `when`(request.requestURI).thenReturn(requestURI)
        `when`(securityUtils.getCurrentUserId()).thenReturn(userId)
        `when`(securityUtils.isCurrentUserAdmin()).thenReturn(false)
        `when`(resourceOwnershipValidator.validateResourceAccess("meeting", meetingId, userId)).thenReturn(false)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(response).sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied: You don't own this resource")
        verify(filterChain, never()).doFilter(request, response)
    }

    @Test
    fun `should handle empty request URI`() {
        // Given
        val requestURI = ""
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should handle null request URI`() {
        // Given
        `when`(request.requestURI).thenReturn(null)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should handle root path`() {
        // Given
        val requestURI = "/"
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should handle non-API paths`() {
        // Given
        val requestURI = "/health"
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }

    @Test
    fun `should handle malformed API paths`() {
        // Given
        val requestURI = "/api/meetings/"
        
        `when`(request.requestURI).thenReturn(requestURI)

        // When
        resourceOwnershipFilter.doFilterInternal(request, response, filterChain)

        // Then
        verify(filterChain).doFilter(request, response)
        verify(securityUtils, never()).getCurrentUserId()
        verify(response, never()).sendError(anyInt(), anyString())
    }
} 