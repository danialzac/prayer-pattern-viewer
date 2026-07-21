package com.prayertracker.patternviewer.api.auth;

import com.prayertracker.patternviewer.security.CurrentUser;
import com.prayertracker.patternviewer.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    //! This controller exposes auth API routes like register, login, and profile lookup.
    //! Controller ni buka route API auth macam register, login, dan profile semasa.
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        //? Input: name, email, password. Output: a JWT token plus basic user info.
        //? Input: nama, email, password. Output: token JWT sekali dengan info user asas.
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        //? Input: email and password. Output: a fresh JWT token if login succeeds.
        //? Input: email dengan password. Output: token JWT baru kalau login berjaya.
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserProfileResponse me(@CurrentUser com.prayertracker.patternviewer.model.AppUser user) {
        //? This route reads the logged-in user from the JWT and returns safe profile data.
        //? Route ni baca user yang tengah login dari JWT dan pulangkan data profile yang selamat.
        return new UserProfileResponse(user.getId(), user.getFullName(), user.getEmail());
    }
}
