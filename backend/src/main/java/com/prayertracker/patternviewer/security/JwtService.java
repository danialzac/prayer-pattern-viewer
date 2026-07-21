package com.prayertracker.patternviewer.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    //! This service creates and checks JWT tokens used for login authentication.
    //! Service ni buat dan check token JWT yang digunakan untuk auth login.
    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        //? These values come from application.properties or environment variables.
        //? Value ni datang dari application.properties atau environment variable.
        byte[] keyBytes = secret.length() >= 32
                ? secret.getBytes()
                : Decoders.BASE64.decode("Y2hhbmdlLXRoaXMtc2VjcmV0LWtleS1jaGFuZ2UtdGhpcy1zZWNyZXQta2V5LTEyMzQ1Ng==");
        //WARN If the secret is too weak, token security gets weaker too.
        //WARN Kalau secret terlalu lemah, security token pun jadi lebih lemah.
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        //! Input: user email. Output: signed token string sent back to the frontend.
        //! Input: email user. Output: token string yang dah signed untuk dihantar ke frontend.
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {
        //? We store the email in the token subject so we can identify the user later.
        //? Kita simpan email dalam subject token supaya nanti boleh kenal pasti user.
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token, String email) {
        //? A token is valid only if it belongs to the expected user and is not expired yet.
        //? Token valid hanya kalau dia milik user yang betul dan belum expired.
        Claims claims = parseClaims(token);
        return email.equals(claims.getSubject()) && claims.getExpiration().after(new Date());
    }

    private Claims parseClaims(String token) {
        //WARN If the token is broken or tampered with, this parsing step can fail.
        //WARN Kalau token rosak atau diubah, step parse ni boleh gagal.
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
