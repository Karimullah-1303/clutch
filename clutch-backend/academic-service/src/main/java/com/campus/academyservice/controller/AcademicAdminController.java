package com.campus.academyservice.controller;

import com.campus.academyservice.client.IdentityServiceClient;
import com.campus.academyservice.dto.UserProfileDto;
import com.campus.academyservice.service.AcademicAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * AcademicAdminController
 * Exposes internal endpoints for system administrators to bulk-provision university data.
 * Uses OpenFeign to securely validate JWTs and extract the tenant (College ID) context.
 */
@RestController
@RequestMapping("/api/v1/academic/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AcademicAdminController {

    private final AcademicAdminService academicAdminService;
    private final IdentityServiceClient identityServiceClient; // 🚨 Inject your Feign Client

    @PostMapping("/upload-timetables")
    public ResponseEntity<String> uploadTimeTables(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) { // 🚨 Catch the JWT directly

        // 1. Securely validate the token and get the Admin's profile
        UserProfileDto adminProfile = identityServiceClient.validateTokenAndGetUser(token);

        // 2. Pass the dynamic College ID to the service
        academicAdminService.processTimetableCsv(file, adminProfile.getCollegeId());

        return ResponseEntity.ok("Timetable uploaded successfully");
    }

    @PostMapping("/upload-subjects")
    public ResponseEntity<String> uploadSubjects(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) {

        // Security check: Just ensure they have a valid admin token before processing
        identityServiceClient.validateTokenAndGetUser(token);

        academicAdminService.processSubjectsCsv(file);
        return ResponseEntity.ok("Subjects uploaded successfully");
    }

    @PostMapping("/upload-enrollments")
    public ResponseEntity<String> uploadEnrollments(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) {

        // 1. Securely validate the token and get the Admin's profile
        UserProfileDto adminProfile = identityServiceClient.validateTokenAndGetUser(token);

        // 2. Pass the dynamic College ID to the service
        academicAdminService.processEnrollmentsCsv(file, adminProfile.getCollegeId());

        return ResponseEntity.ok("Students enrollments uploaded successfully");
    }
}