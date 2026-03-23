package com.campus.placementservice.repo;

import com.campus.placementservice.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    boolean existsByJobPosting_IdAndStudentProfile_StudentId(UUID jobPostingId, UUID studentId);
    List<JobApplication> findByJobPosting_Id(UUID jobPostingId);
    List<JobApplication> findByStudentProfile_StudentId(UUID studentId);
}