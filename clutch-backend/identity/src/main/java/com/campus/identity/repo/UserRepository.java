package com.campus.identity.repo;

import com.campus.identity.entity.AppUser;
import com.campus.identity.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<AppUser, UUID> {

    // Core security query: Only retrieves users who haven't been soft-deleted
    Optional<AppUser> findByEmailAndIsActiveTrue(String email);

    // Quick boolean check used during registration to prevent duplicate accounts
    boolean existsByEmail(String email);

    // Multi-tenant query: Used by the Admin to fetch users only from their specific college
    List<AppUser> findAllByCollegeIdAndRole(UUID collegeId, Role role);
}