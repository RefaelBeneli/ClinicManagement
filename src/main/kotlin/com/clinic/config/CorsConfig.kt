package com.clinic.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order

@Configuration
class CorsConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    fun corsFilter(): CorsFilter {
        val configuration = CorsConfiguration()
        
        // EXTREMELY PERMISSIVE - Allow everything for reliability
        configuration.allowCredentials = true
        configuration.allowedOriginPatterns = listOf(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.netlify.app", 
            "https://*.netlify.com",
            "https://frolicking-granita-900c53.netlify.app"
        )
        configuration.allowedMethods = listOf("*")
        configuration.allowedHeaders = listOf("*")
        configuration.exposedHeaders = listOf("*")
        configuration.maxAge = 7200L
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        
        return CorsFilter(source)
    }
} 