package com.campus.identity.controller;

import com.campus.identity.dto.UserProfileDto;
import com.campus.identity.dto.UserUpdateDto;
import com.campus.identity.entity.AppUser;
import com.campus.identity.repo.UserRepository;
import com.campus.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * UserController
 * Handles profile management and acts as the crucial data hydration bridge for other microservices.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

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

        // BATCH FETCH: Hits the database exactly ONE time, no matter how many IDs there are!
        List<UserProfileDto> profiles = userRepository.findAllById(userIds).stream()
                .map(user -> UserProfileDto.builder()
                        .id(user.getId())
                        .rollNumber(user.getRollNumber())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole().name())
                        .collegeName(user.getCollege().getName())
                        .collegeId(user.getCollege().getId())
                        .build())
                .toList();

        return ResponseEntity.ok(profiles);
    }


    @PostMapping("/batch-names")
    public ResponseEntity<Map<UUID, String>> getTeacherNames(@RequestBody Set<UUID> userIds) {
        // Fetch the users from your Identity database
        List<AppUser> users = userRepository.findAllById(userIds);

        // Convert the List of Users into a Map of {UUID: "Name"}
        Map<UUID, String> nameMap = users.stream()
                .collect(Collectors.toMap(AppUser::getId, AppUser::getName));

        return ResponseEntity.ok(nameMap);
    }
}