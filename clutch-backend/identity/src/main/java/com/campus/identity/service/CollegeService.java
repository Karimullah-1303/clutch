package com.campus.identity.service;

import com.campus.identity.entity.College;
import com.campus.identity.repo.CollegeRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * CollegeService
 * Manages the multi-tenant aspect of the application. Every user is tied to a specific College (Tenant).
 */
@Service
public class CollegeService {
    private final CollegeRepository collegeRepository;

    public CollegeService(CollegeRepository collegeRepository) {
        this.collegeRepository = collegeRepository;
    }

    public College getCollegeById(UUID id) {
        return collegeRepository.findById(id).orElseThrow(()->new RuntimeException("College not found in database"));
    }

    public College createCollege(String name, String domain){
        College college = new College();
        college.setName(name);
        college.setDomain(domain);
        return collegeRepository.save(college);
    }
}