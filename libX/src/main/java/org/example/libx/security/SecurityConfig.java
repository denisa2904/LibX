package org.example.libx.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    public SecurityConfig(@Lazy AuthenticationProvider authenticationProvider, @Lazy JwtAuthenticationFilter jwtAuthFilter) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/api/auth/**").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/api/books/criteria").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/books/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/users/recs").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/api/users/favorites").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/users/favorites").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/users/favorites/**").permitAll();
                    auth.requestMatchers(HttpMethod.DELETE, "/api/users/favorites/**").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/api/books").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/api/books/**").permitAll();
                    auth.requestMatchers(HttpMethod.PUT, "/api/books/**").permitAll();
                    auth.requestMatchers(HttpMethod.DELETE, "/api/books/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/users/self").permitAll();
                    auth.requestMatchers(HttpMethod.PUT, "/api/users/updateSelf").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/users/rented").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/api/users/rented").permitAll();
                    auth.requestMatchers(HttpMethod.DELETE, "/api/users/rented/**").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/users/rented/**").permitAll();
                    auth.requestMatchers(HttpMethod.POST, "/api/users/history").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/api/users/history").permitAll();
                    auth.anyRequest().authenticated();
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
