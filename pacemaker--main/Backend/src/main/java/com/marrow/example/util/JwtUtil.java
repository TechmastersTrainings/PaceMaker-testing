package com.marrow.example.util;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Generate JWT Token with Role and currentYear
    public String generateToken(String email, String role, Integer currentYear) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        String formattedRole = role == null ? "ROLE_STUDENT" : (role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase());
        return Jwts.builder()
                .setSubject(email)
                .claim("role", formattedRole)
                .claim("currentYear", currentYear)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Generate JWT Token with Role (backward compat)
    public String generateToken(String email, String role) {
        return generateToken(email, role, null);
    }

    // Generate JWT Token
    public String generateToken(String email) {
        return generateToken(email, "ROLE_STUDENT");
    }

    // Extract Email From Token
    public String extractEmail(String token) {

        Claims claims =
                Jwts.parserBuilder()
                        .setSigningKey(
                                Keys.hmacShaKeyFor(
                                        secret.getBytes()))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

        return claims.getSubject();
    }

    // Extract Role From Token
    public String extractRole(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", String.class);
    }

    // Extract Current Year From Token
    public Integer extractCurrentYear(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
        try {
            Object cy = claims.get("currentYear");
            if (cy instanceof Number) return ((Number) cy).intValue();
            if (cy instanceof String && !((String) cy).isEmpty()) return Integer.parseInt((String) cy);
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}