package com.clinic.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.regex.Pattern

@Component
class ResourceOwnershipFilter : OncePerRequestFilter() {

    @Autowired
    private lateinit var securityUtils: SecurityUtils

    @Autowired
    private lateinit var resourceOwnershipValidator: ResourceOwnershipValidator

    // Patterns to match protected endpoints (individual resource access)
    private val protectedPatterns = listOf(
        Pattern.compile("/api/meetings/(-?\\d+)$"),
        Pattern.compile("/api/clients/(-?\\d+)$"),
        Pattern.compile("/api/expenses/(-?\\d+)$"),
        Pattern.compile("/api/personal-meetings/(-?\\d+)$")
    )

    // Endpoints that don't need ownership validation
    private val excludedPatterns = listOf(
        Pattern.compile("/api/auth/.*"),
        Pattern.compile("/api/admin/.*"),
        Pattern.compile("/api/meetings$"),
        Pattern.compile("/api/clients$"),
        Pattern.compile("/api/expenses$"),
        Pattern.compile("/api/personal-meetings$")
    )

    // Made public for testing
    public override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val requestURI = request.requestURI ?: ""

        // Skip validation for excluded patterns (auth endpoints, admin endpoints, list endpoints)
        if (isExcludedEndpoint(requestURI)) {
            filterChain.doFilter(request, response)
            return
        }

        // Check if this is a protected resource endpoint
        val resourceInfo = extractResourceInfo(requestURI)
        if (resourceInfo != null) {
            val currentUserId = securityUtils.getCurrentUserId()
            
            if (currentUserId == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not authenticated")
                return
            }

            // Allow admins to access all resources
            if (securityUtils.isCurrentUserAdmin()) {
                filterChain.doFilter(request, response)
                return
            }

            // Validate resource ownership
            val hasAccess = resourceOwnershipValidator.validateResourceAccess(
                resourceInfo.first, resourceInfo.second, currentUserId
            )

            if (!hasAccess) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied: You don't own this resource")
                return
            }
        }

        filterChain.doFilter(request, response)
    }

    private fun isExcludedEndpoint(requestURI: String): Boolean {
        return excludedPatterns.any { it.matcher(requestURI).matches() }
    }

    private fun extractResourceInfo(requestURI: String): Pair<String, Long>? {
        for (pattern in protectedPatterns) {
            val matcher = pattern.matcher(requestURI)
            if (matcher.matches()) {
                val resourceId = matcher.group(1).toLong()
                val resourceType = when {
                    requestURI.contains("/meetings/") -> "meeting"
                    requestURI.contains("/clients/") -> "client"
                    requestURI.contains("/expenses/") -> "expense"
                    requestURI.contains("/personal-meetings/") -> "personalmeeting"
                    else -> return null
                }
                return Pair(resourceType, resourceId)
            }
        }
        return null
    }
} 