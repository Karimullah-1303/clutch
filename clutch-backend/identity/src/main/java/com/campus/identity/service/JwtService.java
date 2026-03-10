package com.campus.identity.service;

import com.campus.identity.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

/**
 * JwtService
 * Handles the cryptographic generation, parsing, and validation of JSON Web Tokens (JWTs)
 * using the modern io.jsonwebtoken API (v0.12+).
 */
@Service
public class JwtService {
    // Highly sensitive symmetric key used to sign and verify tokens.
    // In production, this MUST be injected via environment variables or a secret manager.
    private static final String secret = "VGhpcyBpcyBhIHNlY3VyZSBrZXkgZm9yIEpXVCBzaWduYXR1cmUgMjU2IGJpdHM=";

    /**
     * Generates a new JWT for an authenticated user, injecting custom claims (Role, CollegeId)
     * so that other microservices can authorize actions without querying the database.
     */
    public String generateToken(AppUser user) {
        HashMap<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("collegeId", user.getCollege().getId());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24-hour validity
                .signWith(getSignInKey())
                .compact();
    }

    /**
     * Decodes the Base64 secret string into a cryptographic SecretKey object.
     */
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Validates that the token belongs to the user and has not expired.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses the JWT, verifying the cryptographic signature against our SecretKey.
     * Throws an exception if the token has been tampered with or signed by a different key.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}