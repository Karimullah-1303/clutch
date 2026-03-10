package com.campus.identity.repo;

import com.campus.identity.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CollegeRepository extends JpaRepository<College, UUID> {
    Optional<College> findByName(String name);
    Optional<College> findByDomain(String domain);
}