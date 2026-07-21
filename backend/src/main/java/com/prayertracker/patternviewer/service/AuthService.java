package com.prayertracker.patternviewer.service;

import com.prayertracker.patternviewer.api.auth.AuthRequest;
import com.prayertracker.patternviewer.api.auth.AuthResponse;
import com.prayertracker.patternviewer.api.auth.RegisterRequest;
import com.prayertracker.patternviewer.model.AppUser;
import com.prayertracker.patternviewer.model.UserRole;
import com.prayertracker.patternviewer.repository.AppUserRepository;
import com.prayertracker.patternviewer.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
public class AuthService {
    //! This service handles the main login and registration work.
    //! Service ni urus kerja utama login dan registration.
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        //! Stop duplicate accounts early so one email only belongs to one user.
        //! Hentikan akaun duplicate awal-awal supaya satu email untuk satu user je.
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(BAD_REQUEST, "Email is already registered");
        }

        //? Input: name, email, password. Output: saved user plus a login token.
        //? Input: nama, email, password. Output: user yang dah simpan sekali dengan token login.
        AppUser user = new AppUser();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);

        //! Side effect: after saving the user, we immediately return a JWT so the frontend can keep them signed in.
        //! Side effect: lepas simpan user, kita terus bagi JWT supaya frontend boleh terus anggap dia dah sign in.
        AppUser savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser.getEmail());
        return new AuthResponse(token, savedUser.getFullName(), savedUser.getEmail());
    }

    public AuthResponse login(AuthRequest request) {
        //? Normalize means clean the email into one consistent format before checking it.
        //? Normalize maksudnya kemaskan email jadi satu format konsisten sebelum check.
        String email = request.getEmail().trim().toLowerCase();

        //! Spring Security checks the password here using the AuthenticationManager.
        //! Kat sini Spring Security check password guna AuthenticationManager.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        //? If password is correct, return a fresh token the frontend can store and reuse.
        //? Kalau password betul, pulangkan token baru yang frontend boleh simpan dan guna semula.
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Invalid login"));

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getFullName(), user.getEmail());
    }
}
