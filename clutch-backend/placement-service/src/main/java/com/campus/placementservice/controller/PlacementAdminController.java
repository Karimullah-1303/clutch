package com.campus.placementservice.controller;

import com.campus.placementservice.dto.JobPostingRequestDto;
import com.campus.placementservice.entity.JobApplication;
import com.campus.placementservice.entity.JobPosting;
import com.campus.placementservice.repo.JobApplicationRepository;
import com.campus.placementservice.repo.JobPostingRepository;
import com.campus.placementservice.service.PlacementAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/placement/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlacementAdminController {

    private final PlacementAdminService placementAdminService;
    private final JobApplicationRepository jobApplicationRepository;
    private final JobPostingRepository jobPostingRepository;

    // 1. CSV Upload Endpoint
    @PostMapping("/upload-cgpa")
    public ResponseEntity<String> uploadCgpa(@RequestParam("file") MultipartFile file) {
        placementAdminService.processCgpaCsv(file);
        return ResponseEntity.ok("Student CGPA records uploaded successfully!");
    }

    // 2. The POST endpoint to CREATE the job
    @PostMapping("/jobs")
    public ResponseEntity<JobPosting> createJobPosting(@RequestBody JobPostingRequestDto request) {
        JobPosting newJob = placementAdminService.createJobPosting(request);
        return ResponseEntity.ok(newJob);
    }

    // 3. The GET endpoint to VIEW the jobs in the grid
    @GetMapping("/jobs")
    public ResponseEntity<List<JobPosting>> getAllJobs() {
        return ResponseEntity.ok(placementAdminService.getAllJobs());
    }

    // 4. View all students who applied to a specific job
    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<List<JobApplication>> getApplicants(@PathVariable UUID jobId) {
        return ResponseEntity.ok(jobApplicationRepository.findByJobPosting_Id(jobId));
    }


    @PutMapping("/applications/{appId}/status")
    public ResponseEntity<String> updateStatus(@PathVariable UUID appId, @RequestParam String status) {
        // Calls the Service to update the DB AND fire the notification
        placementAdminService.updateApplicationStatus(appId, status);
        return ResponseEntity.ok("Status updated successfully");
    }

    // 6. Toggle job status
    @PutMapping("/jobs/{jobId}/toggle")
    public ResponseEntity<JobPosting> toggleJobStatus(@PathVariable UUID jobId) {
        // 1. Safely handle the Optional (Prevents 500 crashes)
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

        // 2. Toggle the status
        job.setIsActive(!job.getIsActive());

        // 3. Save and return
        return ResponseEntity.ok(jobPostingRepository.save(job));
    }
}