package com.campus.academyservice.controller;

import com.campus.academyservice.service.AcademicAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * AcademicAdminController
 * Exposes internal endpoints for system administrators to bulk-provision
 * university data (Timetables, Subjects, Enrollments) via CSV payloads.
 */
@RestController
@RequestMapping("/api/v1/academic/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AcademicAdminController {
    private final AcademicAdminService academicAdminService;

    @PostMapping("/upload-timetables")
    public ResponseEntity<String> uploadTimeTables(@RequestParam("file") MultipartFile file) {
        academicAdminService.processTimetableCsv(file);
        return ResponseEntity.ok("Timetable uploaded successfully");
    }

    @PostMapping("/upload-subjects")
    public ResponseEntity<String> uploadSubjects(@RequestParam("file") MultipartFile file) {
        academicAdminService.processSubjectsCsv(file);
        return ResponseEntity.ok("Subjects uploaded successfully");
    }

    @PostMapping("/upload-enrollments")
    public ResponseEntity<String> uploadEnrollments(@RequestParam("file") MultipartFile file) {
        academicAdminService.processEnrollmentsCsv(file);
        return ResponseEntity.ok("Students enrollments uploaded successfully");
    }
}