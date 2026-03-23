package com.campus.placementservice.controller;

import com.campus.placementservice.dto.PortfolioUpdateDto;
import com.campus.placementservice.entity.StudentProfile;
import com.campus.placementservice.repo.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/placement/portfolio")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentPortfolioController {

    private final StudentProfileRepository profileRepository;

    // 1. Get the profile (Includes the Admin-verified CGPA)
    @GetMapping("/{studentId}")
    public ResponseEntity<StudentProfile> getPortfolio(@PathVariable UUID studentId) {
        StudentProfile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Profile not found. Waiting for Admin CGPA upload."));
        return ResponseEntity.ok(profile);
    }

    // 2. Update the links and skills
    @PutMapping("/{studentId}")
    public ResponseEntity<StudentProfile> updatePortfolio(
            @PathVariable UUID studentId,
            @RequestBody PortfolioUpdateDto dto) {

        StudentProfile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Profile not found."));

        // Update the user-controlled fields
        profile.setGithubUrl(dto.getGithubUrl());
        profile.setLeetcodeUrl(dto.getLeetcodeUrl());
        profile.setPortfolioUrl(dto.getPortfolioUrl());
        profile.setResumePdfUrl(dto.getResumePdfUrl());
        profile.setSkills(dto.getSkills());

        // Save and return
        return ResponseEntity.ok(profileRepository.save(profile));
    }
}