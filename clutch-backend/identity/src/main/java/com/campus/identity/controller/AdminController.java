package com.campus.identity.controller;

import com.campus.identity.entity.AppUser;
import com.campus.identity.entity.enums.Role;
import com.campus.identity.repo.UserRepository;
import com.campus.identity.service.AdminService;
import com.campus.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * AdminController
 * Secured endpoints for tenant administration.
 * Class-level @PreAuthorize ensures strictly ADMIN roles can access these routes.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final AdminService adminService;
    private final UserRepository userRepository;

    /**
     * Helper method: Extracts the current Admin's College ID from the database using their JWT identity.
     * Ensures an Admin can only perform actions on their own tenant.
     */
    private UUID getAdminCollegeId(Principal principal) {
        return userRepository.findByEmailAndIsActiveTrue(principal.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"))
                .getCollege().getId();
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<AppUser>> getCollegeTeachers(Principal principal) {
        UUID collegeId = getAdminCollegeId(principal);
        return ResponseEntity.ok(userRepository.findAllByCollegeIdAndRole(collegeId, Role.TEACHER));
    }

    @PostMapping("/upload-users")
    public ResponseEntity<String> uploadUsers(@RequestParam("file") MultipartFile file, Principal principal) {
        // 🚨 FIX: Dynamically fetch the college ID and pass it to the service
        UUID collegeId = getAdminCollegeId(principal);
        adminService.processUsersCsv(file, collegeId);
        return ResponseEntity.ok("Users uploaded successfully!");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Redundant but safe method-level override
    public ResponseEntity<String> deactivateUser(@PathVariable UUID id){
        userService.softDeleteUser(id);
        return ResponseEntity.ok("User account deactivated successfully.");
    }
}