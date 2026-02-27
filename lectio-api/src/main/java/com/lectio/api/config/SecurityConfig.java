package com.lectio.api.config;

import com.lectio.api.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ PÚBLICO - No requiere token
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // ✅ LIBROS
                        .requestMatchers(HttpMethod.POST, "/api/libros/google").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/libros/**").permitAll()

                        // ✅ BIBLIOTECA - Requiere autenticación
                        .requestMatchers("/api/biblioteca/**").authenticated()

                        // ✅ COMENTARIOS - GET público, POST autenticado, DELETE admin
                        .requestMatchers(HttpMethod.GET, "/api/comentarios/libro/**").permitAll()  // ← AÑADIDO
                        .requestMatchers(HttpMethod.POST, "/api/comentarios/libro/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/comentarios/**").hasRole("ADMIN")
                        .requestMatchers("/api/comentarios/admin/**").hasRole("ADMIN")

                        // ✅ ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ✅ RESTO - Autenticado
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}