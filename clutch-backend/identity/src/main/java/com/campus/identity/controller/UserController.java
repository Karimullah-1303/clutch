package com.campus.identity.controller;

import com.campus.identity.dto.UserProfileDto;
import com.campus.identity.dto.UserUpdateDto;
import com.campus.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * UserController
 * Handles profile management and acts as the crucial data hydration bridge for other microservices.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Any user with a valid JWT can view their own profile
    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMyProfile(Principal principal) {
        return ResponseEntity.ok(userService.getProfileByEmail(principal.getName()));
    }

    // Any user with a valid JWT can update their basic profile info
    @PutMapping("/me")
    public ResponseEntity<String> updateMyProfile(Principal principal, @RequestBody UserUpdateDto updateDto) {
        userService.updateProfile(principal.getName(), updateDto);
        return ResponseEntity.ok("Profile updated successfully");
    }

    /**
     * THE MICROSERVICE BRIDGE ENDPOINT
     * Allows internal microservices (like Academy Service) to pass an array of bare UUIDs
     * and receive fully hydrated profile DTOs back (Names, Roll Numbers).
     * Crucial for preventing massive data duplication across databases.
     */
    @PostMapping("/batch")
    public ResponseEntity<List<UserProfileDto>> getUsersByIds(@RequestBody List<UUID> userIds) {
        List<UserProfileDto> profiles = userIds.stream()
                .map(id -> userService.getUserById(id))
                .map(user -> UserProfileDto.builder()
                        .id(user.getId())
                        .rollNumber(user.getRollNumber())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole().name())
                        .collegeName(user.getCollege().getName())
                        .build())
                .toList();

        return ResponseEntity.ok(profiles);
    }
}