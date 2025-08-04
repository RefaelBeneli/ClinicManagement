package com.clinic.security

import com.clinic.entity.User
import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtils {

    private val logger = LoggerFactory.getLogger(JwtUtils::class.java)

    @Value("\${jwt.secret}")
    private lateinit var jwtSecret: String

    @Value("\${jwt.expiration}")
    private var jwtExpirationMs: Int = 0

    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(jwtSecret.toByteArray())
    }

    fun generateJwtToken(authentication: Authentication): String {
        val userPrincipal = authentication.principal as User
        return Jwts.builder()
            .setSubject(userPrincipal.username)
            .claim("userId", userPrincipal.id)
            .setIssuedAt(Date())
            .setExpiration(Date(Date().time + jwtExpirationMs))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact()
    }

    fun getUserNameFromJwtToken(token: String): String {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
            .subject
    }

    fun getUserIdFromJwtToken(token: String): Long {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
            .get("userId", Long::class.java)
    }

    fun validateJwtToken(authToken: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(authToken)
            true
        } catch (e: SecurityException) {
            logger.warn("Invalid JWT signature: ${e.message}")
            false
        } catch (e: MalformedJwtException) {
            logger.warn("Invalid JWT token: ${e.message}")
            false
        } catch (e: ExpiredJwtException) {
            logger.warn("JWT token is expired: ${e.message}")
            false
        } catch (e: UnsupportedJwtException) {
            logger.warn("JWT token is unsupported: ${e.message}")
            false
        } catch (e: IllegalArgumentException) {
            logger.warn("JWT claims string is empty: ${e.message}")
            false
        }
    }
} 