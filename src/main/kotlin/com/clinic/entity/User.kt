package com.clinic.entity

import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.time.LocalDateTime

enum class Role {
    USER, ADMIN
}

enum class UserApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED
}

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false, unique = true)
    private val username: String = "",
    
    @Column(nullable = false)
    val email: String = "",
    
    @Column(nullable = false)
    val fullName: String = "",
    
    @Column(nullable = false)
    private val password: String = "",
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val role: Role = Role.USER,
    
    @Column(nullable = false)
    private val enabled: Boolean = false,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val approvalStatus: UserApprovalStatus = UserApprovalStatus.PENDING,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    val approvedBy: User? = null,
    
    @Column
    val approvedDate: LocalDateTime? = null,
    
    @Column(length = 1000)
    val rejectionReason: String? = null,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) : UserDetails {
    
    override fun getAuthorities(): Collection<GrantedAuthority> {
        return listOf(SimpleGrantedAuthority("ROLE_${role.name}"))
    }
    
    override fun getPassword(): String = password
    override fun getUsername(): String = username
    override fun isAccountNonExpired(): Boolean = true
    override fun isAccountNonLocked(): Boolean = true
    override fun isCredentialsNonExpired(): Boolean = true
    override fun isEnabled(): Boolean = enabled
} 