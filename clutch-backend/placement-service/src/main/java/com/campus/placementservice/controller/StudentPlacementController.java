package com.campus.placementservice.controller;

import com.campus.placementservice.entity.JobApplication;
import com.campus.placementservice.entity.JobPosting;
import com.campus.placementservice.entity.StudentProfile;
import com.campus.placementservice.entity.enums.ApplicationStatus;
import com.campus.placementservice.repo.JobApplicationRepository;
import com.campus.placementservice.repo.JobPostingRepository;
import com.campus.placementservice.repo.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/placement/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentPlacementController {

    private final JobPostingRepository jobPostingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final StudentProfileRepository profileRepository;

    // 1. Fetch the Job Board
    @GetMapping("/jobs")
    public ResponseEntity<List<JobPosting>> getActiveJobs() {
        return ResponseEntity.ok(jobPostingRepository.findAll());
    }

    // 2. The Apply Button Engine
    @PostMapping("/jobs/{jobId}/apply/{studentId}")
    @Transactional
    public ResponseEntity<String> applyForJob(@PathVariable UUID jobId, @PathVariable UUID studentId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        StudentProfile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Placement profile not initialized."));

        // THE GUARDRAIL: Block ineligible students
        if (profile.getCgpa() == null || profile.getCgpa().compareTo(job.getMinCgpa()) < 0) {
            return ResponseEntity.badRequest().body("Ineligible: Your CGPA does not meet the minimum requirement.");
        }

        // PREVENT DUPLICATES: Check if they already applied
        if (jobApplicationRepository.existsByJobPosting_IdAndStudentProfile_StudentId(jobId, studentId)) {
            return ResponseEntity.badRequest().body("You have already applied for this campus drive.");
        }

        JobApplication application = JobApplication.builder()
                .jobPosting(job)
                .studentProfile(profile)
                .status(ApplicationStatus.APPLIED)
                .build();

        jobApplicationRepository.save(application);
        return ResponseEntity.ok("Successfully applied for " + job.getCompanyName() + "!");
    }

    @GetMapping("/{studentId}/applications")
    public ResponseEntity<List<JobApplication>> getMyApplications(@PathVariable UUID studentId) {
        return ResponseEntity.ok(jobApplicationRepository.findByStudentProfile_StudentId(studentId));
    }
}