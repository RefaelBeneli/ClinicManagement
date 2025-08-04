package com.clinic.config

import com.clinic.security.AuthTokenFilter
import com.clinic.security.ResourceOwnershipFilter
import com.clinic.service.UserDetailsServiceImpl
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
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
    @Profile("!prod") // Development and test profiles
    fun developmentFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() } // Disable CSRF for development (stateless JWT)
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { authz ->
                authz
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/h2-console/**").permitAll() // Allow H2 console in development
                    .requestMatchers("/actuator/**").permitAll() // Allow health checks
                    .requestMatchers("OPTIONS", "/**").permitAll() // Allow all OPTIONS requests for CORS
                    .anyRequest().authenticated()
            }
            .headers { headers ->
                headers
                    .frameOptions().sameOrigin() // Allow frames for H2 console in development
            }

        http.authenticationProvider(authenticationProvider())
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter::class.java)
        http.addFilterAfter(resourceOwnershipFilter, AuthTokenFilter::class.java)

        return http.build()
    }

    @Bean
    @Profile("prod") // Production profile only
    fun productionFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() } // Disable CSRF for stateless JWT authentication
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { authz ->
                authz
                    .requestMatchers("/api/auth/**").permitAll()
                    // H2 console disabled in production for security
                    .requestMatchers("/actuator/**").permitAll() // Allow health checks
                    .requestMatchers("OPTIONS", "/**").permitAll() // Allow all OPTIONS requests for CORS
                    .anyRequest().authenticated()
            }
            .headers { headers ->
                headers
                    .frameOptions().deny() // Prevent clickjacking
            }

        http.authenticationProvider(authenticationProvider())
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter::class.java)
        http.addFilterAfter(resourceOwnershipFilter, AuthTokenFilter::class.java)

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        
        // RESTRICTIVE CORS - Only allow specific domains
        configuration.allowedOriginPatterns = listOf(
            "https://frolicking-granita-900c53.netlify.app", // Production frontend
            "http://localhost:3000", // Development frontend
            "http://localhost:3001"  // Alternative dev port
        )
        
        // Allow specific HTTP methods only
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        
        // Allow specific headers only
        configuration.allowedHeaders = listOf(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With"
        )
        
        // Expose only necessary headers
        configuration.exposedHeaders = listOf(
            "Authorization",
            "Content-Type"
        )
        
        // Allow credentials for JWT
        configuration.allowCredentials = true
        
        // Shorter cache time for preflight
        configuration.maxAge = 3600L // 1 hour
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
} 