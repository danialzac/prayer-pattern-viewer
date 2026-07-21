package com.prayertracker.patternviewer.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    //! This config decides which routes are public and how login protection works.
    //! Config ni tentukan route mana public dan macam mana perlindungan login berfungsi.
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationProvider authenticationProvider) throws Exception {
        http
                //! CSRF is disabled because this app uses JWT tokens instead of browser server sessions.
                //! CSRF dimatikan sebab app ni pakai token JWT, bukan session server dalam browser.
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        //! These routes are safe to open without login.
                        //! Route ni selamat untuk dibuka tanpa login.
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/prayer/stats",
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/media/**",
                                "/h2-console/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                //? Stateless means the server trusts the JWT on each request instead of keeping session memory.
                //? Stateless maksudnya server percaya pada JWT setiap request, bukan simpan session dalam memori.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                //! Run our JWT filter before Spring's default login filter.
                //! Jalankan filter JWT kita dulu sebelum filter login default Spring.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        //! This provider checks email/password against user data from the database.
        //! Provider ni check email/password lawan data user dalam database.
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        //WARN Passwords must be hashed before saving. Never store plain text passwords.
        //WARN Password mesti di-hash sebelum simpan. Jangan simpan plain text password.
        return new BCryptPasswordEncoder();
    }
}
