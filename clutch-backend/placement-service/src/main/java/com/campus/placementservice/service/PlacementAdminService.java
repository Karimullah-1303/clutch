package com.campus.placementservice.service;

import com.campus.placementservice.dto.JobPostingRequestDto;
import com.campus.placementservice.entity.JobApplication;
import com.campus.placementservice.entity.JobPosting;
import com.campus.placementservice.entity.Notification;
import com.campus.placementservice.entity.StudentProfile;
import com.campus.placementservice.entity.enums.ApplicationStatus;
import com.campus.placementservice.repo.JobApplicationRepository;
import com.campus.placementservice.repo.JobPostingRepository;
import com.campus.placementservice.repo.NotificationRepository;
import com.campus.placementservice.repo.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlacementAdminService {

    private final StudentProfileRepository profileRepository;
    private final JobPostingRepository jobPostingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void processCgpaCsv(MultipartFile file) {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            br.readLine(); // Skip header row: StudentUUID,RollNumber,CGPA

            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");
                if (data.length < 3) continue;

                // 1. Extract the data
                UUID studentId = UUID.fromString(data[0].trim());
                String rollNumber = data[1].trim();
                BigDecimal cgpa = new BigDecimal(data[2].trim());

                // 2. Fetch existing profile, or auto-create a blank one if it's their first time!
                StudentProfile profile = profileRepository.findById(studentId)
                        .orElseGet(() -> {
                            StudentProfile newProfile = new StudentProfile();
                            newProfile.setStudentId(studentId);
                            newProfile.setRollNumber(rollNumber);
                            return newProfile;
                        });

                // 3. Apply the official academic data
                profile.setCgpa(cgpa);
                profile.setIsCgpaVerified(true); // Boom. University approved.

                // 4. Save to Postgres
                profileRepository.save(profile);
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV Error processing CGPA: " + e.getMessage());
        }
    }

    @Transactional
    public JobPosting createJobPosting(JobPostingRequestDto dto) {
        JobPosting job = JobPosting.builder()
                .companyName(dto.getCompanyName())
                .jobRole(dto.getJobRole())
                .description(dto.getDescription())
                .ctc(dto.getCtc())
                .minCgpa(dto.getMinCgpa())
                .applicationDeadline(dto.getApplicationDeadline())
                .isActive(true)
                .build();

        return jobPostingRepository.save(job);
    }

    public List<JobPosting> getAllJobs() {
        // Fetches all jobs, we can sort them by creation date later!
        return jobPostingRepository.findAll();
    }

    @Transactional
    public void updateApplicationStatus(UUID appId, String status) {
        // 1. Fetch the application
        JobApplication app = jobApplicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // 2. Update the status
        app.setStatus(ApplicationStatus.valueOf(status));
        jobApplicationRepository.save(app);

        // 3. 🚨 CREATE THE NOTIFICATION (Fixed ID Generation)
        try {
            Notification notification = Notification.builder()
                    // 🚨 REMOVED: .id(UUID.randomUUID())
                    // Let Hibernate and Postgres handle the UUID generation automatically!
                    .studentId(app.getStudentProfile().getStudentId())
                    .title("Application Update: " + app.getJobPosting().getCompanyName())
                    .message("Your application status has been updated to: " + status)
                    .isRead(false)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);
            System.out.println("✅ Notification successfully sent to student: " + notification.getStudentId());
        } catch (Exception e) {
            System.err.println("❌ Failed to create notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}