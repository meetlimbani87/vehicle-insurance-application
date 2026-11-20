package com.insurance.vehicle.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                           JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                           org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // CORS preflight (OPTIONS) requests never carry an Authorization header -
                        // if these hit the auth checks below first, Spring Security rejects them
                        // before CorsConfig ever gets a chance to add CORS headers, and the browser
                        // reports it as "blocked by CORS policy" even though the real cause is this.
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        // Policy module is now real (Postgres-backed, owned per-user), so it's the
                        // first one locked down: every /policies/** call needs a valid JWT.
                        .requestMatchers("/policies/**").authenticated()
                        // Claim module is now real too - role/ownership checks happen
                        // inside ClaimServiceImpl, but a valid JWT is required first.
                        .requestMatchers("/claims/**").authenticated()
                        .requestMatchers("/payments/**").authenticated()
                        .requestMatchers("/notifications/**").authenticated()
                        .requestMatchers("/users/**").authenticated()
                        // Admin section: role-checked, not just authenticated - nothing
                        // under here is ever customer-facing
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        // TODO: everything else is still open, lock the remaining
                        // endpoints down (authenticated() / hasRole) one module at a time
                        .anyRequest().permitAll()
                )
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
