package com.campus.academyservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration
 * Configures the Academy Service as a stateless, internal resource server.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF since we are using stateless JWTs, not browser session cookies
                .csrf(AbstractHttpConfigurer::disable)

                // Enforce strict statelessness; Spring Security will not create HTTP Sessions
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // ARCHITECTURAL DECISION:
                        // We permit all incoming traffic at the edge filter layer.
                        // Why? Because our Controllers delegate actual token validation and RBAC
                        // to the custom IdentityServiceClient OpenFeign implementation.
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}