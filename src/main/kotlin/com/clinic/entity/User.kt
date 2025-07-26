package com.clinic.entity

import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(unique = true, nullable = false)
    private val username: String,
    
    @Column(nullable = false)
    private val password: String,
    
    @Column(nullable = false)
    val email: String,
    
    @Column(name = "full_name", nullable = false)
    val fullName: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "is_enabled", nullable = false)
    private val enabled: Boolean = true
) : UserDetails {
    
    override fun getAuthorities(): Collection<GrantedAuthority> = emptyList()
    
    override fun getPassword(): String = password
    
    override fun getUsername(): String = username
    
    override fun isAccountNonExpired(): Boolean = true
    
    override fun isAccountNonLocked(): Boolean = true
    
    override fun isCredentialsNonExpired(): Boolean = true
    
    override fun isEnabled(): Boolean = enabled
} 