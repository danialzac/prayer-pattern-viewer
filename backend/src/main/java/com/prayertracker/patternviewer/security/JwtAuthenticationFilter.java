package com.prayertracker.patternviewer.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    //! A filter runs on every request before it reaches the controller.
    //! Filter ni jalan pada setiap request sebelum dia sampai ke controller.
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        //! Read the Authorization header. We expect something like "Bearer <token>".
        //! Baca header Authorization. Kita expect format lebih kurang "Bearer <token>".
        String header = request.getHeader("Authorization");

        //? If there is no token, we do not log the user in here. Public routes can still continue.
        //? Kalau tak ada token, kita tak login user kat sini. Route public masih boleh terus jalan.
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        String email = jwtService.extractEmail(token);

        //! Only set login state if Spring Security has not already done it for this request.
        //! Set status login hanya kalau Spring Security belum buat lagi untuk request ni.
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (jwtService.isValid(token, userDetails.getUsername())) {
                //? This object tells Spring Security, "this request belongs to this logged-in user".
                //? Object ni bagitahu Spring Security, "request ni milik user yang dah login ni".
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        //? Always continue the request chain, or the request will stop here.
        //? Sentiasa teruskan chain request, kalau tak request akan berhenti kat sini.
        filterChain.doFilter(request, response);
    }
}
