package com.clinic.security

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.security.Key
import java.util.*

@Component
class JwtUtils {

    @Value("\${jwt.secret}")
    private lateinit var jwtSecret: String

    @Value("\${jwt.expiration}")
    private var jwtExpirationMs: Int = 0

    private val key: Key by lazy {
        Keys.hmacShaKeyFor(jwtSecret.toByteArray())
    }

    fun generateJwtToken(authentication: Authentication): String {
        val userPrincipal = authentication.principal as org.springframework.security.core.userdetails.UserDetails
        return Jwts.builder()
            .setSubject(userPrincipal.username)
            .setIssuedAt(Date())
            .setExpiration(Date(Date().time + jwtExpirationMs))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact()
    }

    fun getUserNameFromJwtToken(token: String): String {
        return Jwts.parser()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .body
            .subject
    }

    fun validateJwtToken(authToken: String): Boolean {
        try {
            Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(authToken)
            return true
        } catch (e: SecurityException) {
            println("Invalid JWT signature: ${e.message}")
        } catch (e: MalformedJwtException) {
            println("Invalid JWT token: ${e.message}")
        } catch (e: ExpiredJwtException) {
            println("JWT token is expired: ${e.message}")
        } catch (e: UnsupportedJwtException) {
            println("JWT token is unsupported: ${e.message}")
        } catch (e: IllegalArgumentException) {
            println("JWT claims string is empty: ${e.message}")
        }
        return false
    }
} 