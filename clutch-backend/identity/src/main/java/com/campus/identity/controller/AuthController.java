package com.campus.identity.controller;

import com.campus.identity.dto.AuthResponseDto;
import com.campus.identity.dto.ChangePasswordDto;
import com.campus.identity.dto.LoginDto;
import com.campus.identity.dto.RegisterDto;
import com.campus.identity.entity.AppUser;
import com.campus.identity.service.AuthService;
import com.campus.identity.service.JwtService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * AuthController
 * The public-facing gateway for the application. Handles initial credential exchanges
 * and issues JWTs for subsequent requests.
 */
@Data
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final JwtService jwtService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterDto request) {

        AppUser appUser = authService.register(
                request.getEmail(),
                request.getPassword(),
                request.getRole(),
                request.getCollegeId()
        );

        String jwtToken = jwtService.generateToken(appUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponseDto(jwtToken, "User successfully registered", appUser.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginDto request) {
        AppUser appUser = authService.login(request.getEmail(), request.getPassword());

        // The user verified their identity, so we issue them a cryptographic "passport"
        String jwtToken = jwtService.generateToken(appUser);

        return ResponseEntity.ok(new AuthResponseDto(jwtToken, "Login successful", appUser.getId()));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordDto request) {

        // principal.getName() securely extracts the email from the validated JWT token
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok("Password updated successfully!");
    }
}