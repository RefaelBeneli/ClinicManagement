package com.clinic.config

import com.clinic.security.AuthTokenFilter
import com.clinic.security.ResourceOwnershipFilter
import com.clinic.service.UserDetailsServiceImpl
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class WebSecurityConfig {

    @Autowired
    private lateinit var userDetailsService: UserDetailsServiceImpl

    @Autowired
    private lateinit var authTokenFilter: AuthTokenFilter

    @Autowired
    private lateinit var resourceOwnershipFilter: ResourceOwnershipFilter

    @Bean
    fun authenticationProvider(): DaoAuthenticationProvider {
        val authProvider = DaoAuthenticationProvider()
        authProvider.setUserDetailsService(userDetailsService)
        authProvider.setPasswordEncoder(passwordEncoder())
        return authProvider
    }

    @Bean
    fun authenticationManager(authConfig: AuthenticationConfiguration): AuthenticationManager {
        return authConfig.authenticationManager
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http.cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { authz ->
                authz
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/h2-console/**").permitAll()
                    .requestMatchers("/actuator/**").permitAll() // Allow health checks
                    .requestMatchers("OPTIONS", "/**").permitAll() // Allow all OPTIONS requests for CORS
                    .anyRequest().authenticated()
            }
            .headers { it.frameOptions().disable() } // For H2 console

        http.authenticationProvider(authenticationProvider())
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter::class.java)
        http.addFilterAfter(resourceOwnershipFilter, AuthTokenFilter::class.java)

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        
        // VERY PERMISSIVE CORS - Allow all Netlify subdomains and localhost
        configuration.allowedOriginPatterns = listOf(
            "http://localhost:*",
            "http://127.0.0.1:*", 
            "https://*.netlify.app",
            "https://*.netlify.com",
            "https://frolicking-granita-900c53.netlify.app"
        )
        
        // Allow ALL HTTP methods
        configuration.allowedMethods = listOf("*")
        
        // Allow ALL headers
        configuration.allowedHeaders = listOf("*")
        
        // Expose ALL headers that might be needed
        configuration.exposedHeaders = listOf(
            "*"
        )
        
        // CRITICAL: Allow credentials for JWT
        configuration.allowCredentials = true
        
        // Longer cache time for preflight to reduce requests
        configuration.maxAge = 7200L // 2 hours
        
        val source = UrlBasedCorsConfigurationSource()
        // Apply to ALL endpoints
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
} 