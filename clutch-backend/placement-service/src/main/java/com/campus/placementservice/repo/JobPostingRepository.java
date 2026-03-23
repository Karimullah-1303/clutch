package com.campus.placementservice.repo;

import com.campus.placementservice.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {
    // We will add custom queries here later when students need to view the job board!
}