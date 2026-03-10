package com.campus.academyservice.controller;

import com.campus.academyservice.repo.StudentEnrollmentRepository;
import com.campus.academyservice.entity.StudentEnrollment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * SectionController
 * Exposes API endpoints for managing distinct class groups (Sections).
 */
@RestController
@RequestMapping("/api/v1/sections")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows the React frontend to bypass CORS restrictions
public class SectionController {

    private final StudentEnrollmentRepository enrollmentRepo;

    /**
     * Retrieves the roster mapping for a specific section.
     * Returns an array of UUIDs that the frontend uses to query the Identity Service for real names.
     */
    @GetMapping("/{sectionId}/students")
    public ResponseEntity<List<UUID>> getStudentsInSection(@PathVariable UUID sectionId) {

        // Maps the relational StudentEnrollment entity down to a flat list of UUID strings
        List<UUID> studentIds = enrollmentRepo.findAllBySectionId(sectionId)
                .stream()
                .map(StudentEnrollment::getStudentId)
                .toList();

        return ResponseEntity.ok(studentIds);
    }
}